import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { io, Socket } from 'socket.io-client';

import { AuthService } from '../../services/auth';
import { SwapService } from '../../services/swap';

interface ChatMessage {
  senderId: string;
  messageText: string;
  timestamp: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class ChatComponent implements OnInit, OnDestroy {

  private socket!: Socket;

  swapId = '';

  messages: ChatMessage[] = [];

  newMessageText = '';

  currentUserId = '';

  loadingHistory = true;

  historyError = '';

  socketConnected = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly swapService: SwapService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.swapId = String(
      this.route.snapshot.paramMap.get('swapId') || ''
    ).trim();

    this.loadCurrentUser();

    if (this.swapId) {
      this.loadChatHistory();
    } else {
      this.loadingHistory = false;
      this.historyError = 'Invalid swap request.';
      this.changeDetectorRef.detectChanges();
    }

    this.connectSocket();
  }

  private connectSocket(): void {

    this.socket = io('http://localhost:5000', {
      transports: ['polling', 'websocket']
    });

    this.socket.on('connect', () => {

      this.socketConnected = true;

      console.log(
        'CHAT FRONTEND CONNECTED:',
        this.socket.id
      );

      if (this.swapId) {
        this.socket.emit(
          'join_swap_room',
          this.swapId
        );

        console.log(
          'CHAT FRONTEND JOIN ROOM:',
          this.swapId
        );
      }

      this.changeDetectorRef.detectChanges();
    });

    this.socket.on(
      'disconnect',
      (reason: string) => {

        this.socketConnected = false;

        console.warn(
          'CHAT FRONTEND DISCONNECTED:',
          reason
        );

        this.changeDetectorRef.detectChanges();
      }
    );

    this.socket.on(
      'connect_error',
      (error: Error) => {

        this.socketConnected = false;

        console.error(
          'CHAT FRONTEND SOCKET ERROR:',
          error
        );

        this.historyError =
          'Unable to connect to chat server.';

        this.changeDetectorRef.detectChanges();
      }
    );

    this.socket.on(
      'receive_message',
      (message: ChatMessage) => {

        if (
          !message ||
          !message.senderId ||
          !message.messageText
        ) {
          return;
        }

        const normalizedMessage: ChatMessage = {
          senderId: String(message.senderId).trim(),
          messageText: String(message.messageText).trim(),
          timestamp:
            message.timestamp ||
            new Date().toISOString()
        };

        if (
          !normalizedMessage.senderId ||
          !normalizedMessage.messageText
        ) {
          return;
        }

        const alreadyExists =
          this.messages.some(
            existing =>
              existing.senderId ===
                normalizedMessage.senderId &&
              existing.messageText ===
                normalizedMessage.messageText &&
              existing.timestamp ===
                normalizedMessage.timestamp
          );

        if (alreadyExists) {
          return;
        }

        this.messages.push(normalizedMessage);

        this.historyError = '';

        this.changeDetectorRef.detectChanges();

        this.scrollToBottom();

      }
    );

    this.socket.on(
      'chat_error',
      (response: any) => {

        console.error(
          'CHAT SERVER ERROR:',
          response
        );

        this.historyError =
          response?.message ||
          'Unable to send chat message.';

        this.changeDetectorRef.detectChanges();
      }
    );
  }

  private loadCurrentUser(): void {

    const user =
      this.authService.getUser();

    if (user) {

      this.currentUserId =
        String(
          user.id ||
          user._id ||
          ''
        ).trim();

      if (this.currentUserId) {
        return;
      }
    }

    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {
      console.warn(
        'CHAT USER NOT FOUND IN LOCAL STORAGE'
      );
      return;
    }

    try {

      const parsedUser =
        JSON.parse(storedUser);

      this.currentUserId =
        String(
          parsedUser?.id ||
          parsedUser?._id ||
          ''
        ).trim();

    } catch (error) {

      console.error(
        'CHAT USER PARSE ERROR:',
        error
      );

      this.currentUserId = '';
    }
  }

  private loadChatHistory(): void {

    this.loadingHistory = true;

    this.historyError = '';

    this.swapService
      .getSwapById(this.swapId)
      .subscribe({

        next: (response: any) => {

          const swap =
            response?.swap ||
            response?.data ||
            null;

          const serverMessages =
            Array.isArray(swap?.messages)
              ? swap.messages
              : [];

          this.messages =
            serverMessages
              .map((message: any): ChatMessage => ({
                senderId:
                  String(
                    message?.senderId || ''
                  ).trim(),

                messageText:
                  String(
                    message?.messageText || ''
                  ).trim(),

                timestamp:
                  message?.timestamp ||
                  new Date().toISOString()
              }))
              .filter(
                (message: ChatMessage) =>
                  !!message.senderId &&
                  !!message.messageText
              );

          this.loadingHistory = false;

          this.changeDetectorRef.detectChanges();

          this.scrollToBottom();

        },

        error: (error: any) => {

          console.error(
            'CHAT HISTORY ERROR:',
            error
          );

          this.loadingHistory = false;

          this.historyError =
            error?.error?.message ||
            'Unable to load chat history.';

          this.changeDetectorRef.detectChanges();
        }

      });
  }

  sendMessage(): void {

    const messageText =
      this.newMessageText.trim();

    if (!messageText) {
      return;
    }

    if (messageText.length > 2000) {

      this.historyError =
        'Message cannot exceed 2000 characters.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    if (!this.socket) {

      this.historyError =
        'Chat connection is not ready.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    if (!this.swapId) {

      this.historyError =
        'Invalid swap request.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    if (!this.currentUserId) {

      this.historyError =
        'Your login session could not be identified. Please log in again.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    if (!this.socketConnected) {

      this.historyError =
        'Chat connection is currently unavailable.';

      this.changeDetectorRef.detectChanges();

      return;
    }

    const payload = {
      swapId: this.swapId,
      senderId: this.currentUserId,
      messageText
    };

    console.log(
      'CHAT FRONTEND SEND:',
      payload
    );

    this.historyError = '';

    this.socket.emit(
      'send_message',
      payload
    );

    this.newMessageText = '';

    this.changeDetectorRef.detectChanges();
  }

  onMessageInput(): void {

    if (
      this.newMessageText.length > 2000
    ) {
      this.newMessageText =
        this.newMessageText.substring(
          0,
          2000
        );
    }
  }

  isMyMessage(
    message: ChatMessage
  ): boolean {

    return (
      String(message.senderId).trim() ===
      String(this.currentUserId).trim()
    );
  }

  formatMessageTime(
    timestamp: string
  ): string {

    if (!timestamp) {
      return '';
    }

    const date =
      new Date(timestamp);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '';
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  private scrollToBottom(): void {

    setTimeout(() => {

      const container =
        document.querySelector(
          '.chat-message-container'
        );

      if (
        container instanceof HTMLElement
      ) {

        container.scrollTop =
          container.scrollHeight;
      }

    }, 50);
  }

  ngOnDestroy(): void {

    if (this.socket) {

      this.socket.disconnect();

      console.log(
        'CHAT FRONTEND SOCKET DISCONNECTED'
      );
    }
  }
}