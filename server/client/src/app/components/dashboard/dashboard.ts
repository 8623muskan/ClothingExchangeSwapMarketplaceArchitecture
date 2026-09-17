import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SwapService } from '../../services/swap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  swaps: any[] = [];

  currentUserId = '';

  loading = false;

  errorMessage = '';

  updatingSwapId = '';

  constructor(
    private readonly swapService: SwapService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserId();
  }

  private loadUserId(): void {

    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {

      this.currentUserId = '';

      this.loading = false;

      this.errorMessage =
        'Please log in to view your dashboard.';

      console.error(
        'DASHBOARD: No stored user found.'
      );

      this.cdr.detectChanges();

      return;
    }

    try {

      const user =
        JSON.parse(storedUser);

      this.currentUserId =
        String(
          user?._id ||
          user?.id ||
          ''
        ).trim();

      console.log(
        'DASHBOARD CURRENT USER ID:',
        this.currentUserId
      );

    } catch (error) {

      this.currentUserId = '';

      this.loading = false;

      this.errorMessage =
        'Unable to load your account information.';

      console.error(
        'DASHBOARD USER PARSE ERROR:',
        error
      );

      this.cdr.detectChanges();

      return;
    }

    if (!this.currentUserId) {

      this.loading = false;

      this.errorMessage =
        'Unable to identify the logged-in user.';

      console.error(
        'DASHBOARD: User ID is missing.'
      );

      this.cdr.detectChanges();

      return;
    }

    this.loadUserSwaps();
  }

  loadUserSwaps(): void {

    if (!this.currentUserId) {

      this.loading = false;

      this.errorMessage =
        'Unable to identify the logged-in user.';

      console.warn(
        'DASHBOARD: Cannot load swaps without user ID.'
      );

      this.cdr.detectChanges();

      return;
    }

    this.loading = true;

    this.errorMessage = '';

    console.log(
      'DASHBOARD LOADING SWAPS FOR:',
      this.currentUserId
    );

    this.cdr.detectChanges();

    this.swapService
      .getUserSwaps(this.currentUserId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'DASHBOARD SWAPS RESPONSE:',
            response
          );

          if (
            response?.success === false
          ) {

            this.swaps = [];

            this.errorMessage =
              response?.message ||
              'Unable to load swap requests.';

          } else {

            this.swaps =
              Array.isArray(response?.swaps)
                ? response.swaps
                : Array.isArray(response?.data)
                  ? response.data
                  : Array.isArray(response)
                    ? response
                    : [];

            console.log(
              'DASHBOARD SWAPS COUNT:',
              this.swaps.length
            );
          }

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'DASHBOARD SWAPS ERROR:',
            error
          );

          this.swaps = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load your swap requests.';

          this.cdr.detectChanges();
        }
      });
  }

  isPending(status: string): boolean {

    return this.normalizeStatus(status) === 'pending';
  }

  isAccepted(status: string): boolean {

    return this.normalizeStatus(status) === 'accepted';
  }

  isRejected(status: string): boolean {

    return this.normalizeStatus(status) === 'rejected';
  }

  isCancelled(status: string): boolean {

    return this.normalizeStatus(status) === 'cancelled';
  }

  isCompleted(status: string): boolean {

    return this.normalizeStatus(status) === 'completed';
  }

  private normalizeStatus(status: string): string {

    return String(
      status || ''
    )
      .toLowerCase()
      .trim();
  }

  isRequester(swap: any): boolean {

    const requesterId =
      swap?.requester?._id ||
      swap?.requester?.id ||
      swap?.requester ||
      '';

    return (
      String(requesterId).trim() ===
      String(this.currentUserId).trim()
    );
  }

  isOwner(swap: any): boolean {

    const ownerId =
      swap?.owner?._id ||
      swap?.owner?.id ||
      swap?.owner ||
      '';

    return (
      String(ownerId).trim() ===
      String(this.currentUserId).trim()
    );
  }

  getRoleLabel(swap: any): string {

    if (this.isRequester(swap)) {
      return 'You requested this item';
    }

    if (this.isOwner(swap)) {
      return 'Someone requested your item';
    }

    return 'Swap participant';
  }

  getOtherUserName(swap: any): string {

    if (this.isRequester(swap)) {

      return (
        swap?.owner?.name ||
        swap?.owner?.username ||
        swap?.owner?.email ||
        'Item owner'
      );
    }

    return (
      swap?.requester?.name ||
      swap?.requester?.username ||
      swap?.requester?.email ||
      'Requester'
    );
  }

  getStatusLabel(status: string): string {

    const normalized =
      this.normalizeStatus(status);

    switch (normalized) {

      case 'pending':
        return 'Pending';

      case 'accepted':
        return 'Accepted';

      case 'rejected':
        return 'Rejected';

      case 'cancelled':
        return 'Cancelled';

      case 'completed':
        return 'Completed';

      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: string): string {

    switch (
      this.normalizeStatus(status)
    ) {

      case 'pending':
        return 'status-pending';

      case 'accepted':
        return 'status-accepted';

      case 'rejected':
        return 'status-rejected';

      case 'cancelled':
        return 'status-cancelled';

      case 'completed':
        return 'status-completed';

      default:
        return 'status-default';
    }
  }

  getImageUrl(
    imageUrl: string | null | undefined
  ): string {

    if (
      !imageUrl ||
      !String(imageUrl).trim()
    ) {

      return 'assets/images/placeholder-clothing.svg';
    }

    const value =
      String(imageUrl).trim();

    if (
      /^https?:\/\//i.test(value)
    ) {
      return value;
    }

    if (
      value.startsWith('/uploads/')
    ) {

      return `http://127.0.0.1:5000${value}`;
    }

    if (
      value.startsWith('uploads/')
    ) {

      return `http://127.0.0.1:5000/${value}`;
    }

    return value;
  }

  onImageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (!image) {
      return;
    }

    image.onerror = null;

    image.src =
      'assets/images/placeholder-clothing.svg';
  }

  getRequestedItemTitle(
    swap: any
  ): string {

    return (
      swap?.requestedItem?.title ||
      'Requested item'
    );
  }

  getOfferedItemTitle(
    swap: any
  ): string {

    return (
      swap?.offeredItem?.title ||
      'No item offered'
    );
  }

  getRequestedItemImage(
    swap: any
  ): string {

    return this.getImageUrl(
      swap?.requestedItem?.imageUrl
    );
  }

  getOfferedItemImage(
    swap: any
  ): string {

    return this.getImageUrl(
      swap?.offeredItem?.imageUrl
    );
  }

  formatDate(
    value: string | undefined
  ): string {

    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '';
    }

    return date.toLocaleDateString(
      [],
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  formatTime(
    value: string | undefined
  ): string {

    if (!value) {
      return '';
    }

    const date =
      new Date(value);

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

  updateStatus(
    swapId: string,
    status: string
  ): void {

    const cleanSwapId =
      String(swapId || '').trim();

    const cleanStatus =
      this.normalizeStatus(status);

    if (
      !cleanSwapId ||
      !cleanStatus
    ) {

      console.error(
        'DASHBOARD: Missing swap ID or status.'
      );

      return;
    }

    if (this.updatingSwapId) {
      return;
    }

    console.log(
      'DASHBOARD UPDATING SWAP:',
      {
        swapId: cleanSwapId,
        status: cleanStatus
      }
    );

    this.updatingSwapId =
      cleanSwapId;

    this.errorMessage = '';

    this.cdr.detectChanges();

    this.swapService
      .updateSwapStatus(
        cleanSwapId,
        cleanStatus
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'SWAP STATUS UPDATED:',
            response
          );

          this.updatingSwapId = '';

          this.loadUserSwaps();
        },

        error: (error: any) => {

          console.error(
            'SWAP STATUS UPDATE ERROR:',
            error
          );

          this.updatingSwapId = '';

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to update swap status.';

          this.cdr.detectChanges();
        }
      });
  }

  cancelSwap(
    swapId: string
  ): void {

    this.updateStatus(
      swapId,
      'cancelled'
    );
  }

  acceptSwap(
    swapId: string
  ): void {

    this.updateStatus(
      swapId,
      'accepted'
    );
  }

  rejectSwap(
    swapId: string
  ): void {

    this.updateStatus(
      swapId,
      'rejected'
    );
  }

  completeSwap(
    swapId: string
  ): void {

    this.updateStatus(
      swapId,
      'completed'
    );
  }

  trackBySwapId(
    index: number,
    swap: any
  ): string {

    return String(
      swap?._id ||
      swap?.id ||
      index
    );
  }

  getPendingCount(): number {

    return this.swaps.filter(
      swap => this.isPending(swap?.status)
    ).length;
  }

  getAcceptedCount(): number {

    return this.swaps.filter(
      swap => this.isAccepted(swap?.status)
    ).length;
  }

  getCompletedCount(): number {

    return this.swaps.filter(
      swap => this.isCompleted(swap?.status)
    ).length;
  }
}