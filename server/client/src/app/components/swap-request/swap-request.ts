import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { SwapService } from '../../services/swap';
import { ItemService } from '../../services/item';

@Component({
  selector: 'app-swap-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './swap-request.html',
  styleUrl: './swap-request.scss'
})
export class SwapRequestComponent implements OnInit {

  requestedItemId = '';

  readonly requestedItem =
    signal<any | null>(null);

  readonly userItems =
    signal<any[]>([]);

  selectedOfferedItem = '';

  message = '';

  readonly loading =
    signal(true);

  readonly submitting =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  pendingRequestExists = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly swapService: SwapService,
    private readonly itemService: ItemService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(
      (params) => {

        this.requestedItemId =
          String(
            params['itemId'] ||
            params['requestedItem'] ||
            ''
          ).trim();

        if (!this.requestedItemId) {

          this.loading.set(false);

          this.errorMessage.set(
            'Requested clothing item is missing.'
          );

          return;
        }

        this.loading.set(true);

        this.errorMessage.set('');
        this.successMessage.set('');

        this.requestedItem.set(null);
        this.userItems.set([]);

        this.selectedOfferedItem = '';
        this.message = '';
        this.pendingRequestExists = false;

        console.log(
          'SWAP REQUEST ITEM ID:',
          this.requestedItemId
        );

        this.loadRequestedItem();
        this.loadMyItems();
        this.checkExistingSwapRequest();
      }
    );
  }

  private loadRequestedItem(): void {

    this.itemService
      .getItemById(this.requestedItemId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'REQUESTED ITEM RESPONSE:',
            response
          );

          const item =
            response?.data ||
            response?.item ||
            response ||
            null;

          if (!item) {

            this.errorMessage.set(
              'Requested clothing item could not be found.'
            );

            this.loading.set(false);

            return;
          }

          this.requestedItem.set(item);

          console.log(
            'REQUESTED ITEM OWNER:',
            item?.owner
          );

          console.log(
            'CURRENT USER:',
            this.getCurrentUser()
          );

          this.updateLoadingState();
        },

        error: (error: any) => {

          console.error(
            'LOAD REQUESTED ITEM ERROR:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Failed to load the requested clothing item.'
          );

          this.loading.set(false);
        }
      });
  }

  private loadMyItems(): void {

    this.itemService
      .getMyListings()
      .subscribe({

        next: (response: any) => {

          console.log(
            'MY ITEMS RESPONSE:',
            response
          );

          const items =
            Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.items)
                ? response.items
                : Array.isArray(response)
                  ? response
                  : [];

          const filteredItems =
            items.filter((item: any) => {

              const itemId =
                String(
                  item?._id ||
                  item?.id ||
                  ''
                ).trim();

              return (
                itemId.length > 0 &&
                itemId !==
                String(
                  this.requestedItemId
                ).trim()
              );
            });

          this.userItems.set(
            filteredItems
          );

          console.log(
            'MY SWAP ITEMS:',
            filteredItems
          );
        },

        error: (error: any) => {

          console.error(
            'LOAD MY ITEMS ERROR:',
            error
          );

          if (!this.errorMessage()) {

            this.errorMessage.set(
              error?.error?.message ||
              'Failed to load your clothing items.'
            );
          }
        }
      });
  }

  private getCurrentUser(): any | null {

    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {

      return JSON.parse(storedUser);

    } catch (error) {

      console.error(
        'FAILED TO PARSE CURRENT USER:',
        error
      );

      return null;
    }
  }

  private getCurrentUserId(): string {

    const user =
      this.getCurrentUser();

    return String(
      user?._id ||
      user?.id ||
      ''
    ).trim();
  }

  isOwnRequestedItem(): boolean {

    const item =
      this.requestedItem();

    if (!item) {
      return false;
    }

    const owner =
      item?.owner;

    const ownerId =
      owner &&
      typeof owner === 'object'
        ? String(
            owner?._id ||
            owner?.id ||
            ''
          ).trim()
        : String(
            owner ||
            ''
          ).trim();

    const currentUserId =
      this.getCurrentUserId();

    if (
      !ownerId ||
      !currentUserId
    ) {
      return false;
    }

    return ownerId === currentUserId;
  }

  private checkExistingSwapRequest(): void {

    const userId =
      this.getCurrentUserId();

    if (!userId) {

      console.warn(
        'NO CURRENT USER ID FOUND.'
      );

      return;
    }

    this.swapService
      .getUserSwaps(userId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'EXISTING SWAPS RESPONSE:',
            response
          );

          const swaps =
            Array.isArray(response?.swaps)
              ? response.swaps
              : Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                  ? response
                  : [];

          const existingPending =
            swaps.some((swap: any) => {

              const requestedItem =
                swap?.requestedItem;

              const swapRequestedItemId =
                requestedItem &&
                typeof requestedItem === 'object'
                  ? String(
                      requestedItem?._id ||
                      requestedItem?.id ||
                      ''
                    ).trim()
                  : String(
                      requestedItem ||
                      ''
                    ).trim();

              return (
                swapRequestedItemId ===
                String(
                  this.requestedItemId
                ).trim() &&
                String(
                  swap?.status ||
                  ''
                ).toLowerCase().trim() ===
                'pending'
              );
            });

          this.pendingRequestExists =
            existingPending;

          if (existingPending) {

            console.log(
            'PENDING SWAP ALREADY EXISTS FOR THIS ITEM:',
            this.requestedItemId
          );
          }
        },

        error: (error: any) => {

          console.error(
            'CHECK EXISTING SWAPS ERROR:',
            error
          );
        }
      });
  }

  private updateLoadingState(): void {

    if (this.requestedItem()) {

      this.loading.set(false);

      return;
    }

    if (this.errorMessage()) {

      this.loading.set(false);
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

  hasValidOfferItem(): boolean {

    if (!this.selectedOfferedItem) {
      return false;
    }

    return this.userItems().some(
      (item: any) => {

        const itemId =
          String(
            item?._id ||
            item?.id ||
            ''
          ).trim();

        return (
          itemId ===
          String(
            this.selectedOfferedItem
          ).trim()
        );
      }
    );
  }

  submitSwapRequest(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (
      this.isOwnRequestedItem()
    ) {

      this.errorMessage.set(
        'You cannot request a swap for your own item.'
      );

      console.warn(
        'SWAP BLOCKED: Requested item belongs to current user.'
      );

      return;
    }

    if (
      this.pendingRequestExists
    ) {

      this.errorMessage.set(
        'You already have a pending swap request for this item.'
      );

      return;
    }

    if (!this.requestedItemId) {

      this.errorMessage.set(
        'Requested clothing item is missing.'
      );

      return;
    }

    if (!this.selectedOfferedItem) {

      this.errorMessage.set(
        'Please select a clothing item to offer.'
      );

      return;
    }

    if (!this.hasValidOfferItem()) {

      this.errorMessage.set(
        'Please select one of your own clothing items.'
      );

      return;
    }

    if (this.submitting()) {
      return;
    }

    const requestedId =
      String(
        this.requestedItemId
      ).trim();

    const offeredId =
      String(
        this.selectedOfferedItem
      ).trim();

    const payload = {
      requestedItem: requestedId,
      offeredItem: offeredId,
      message: this.message.trim()
    };

    console.log(
      'FINAL SWAP PAYLOAD:',
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    this.submitting.set(true);

    this.swapService
      .sendSwapRequest(payload)
      .subscribe({

        next: (response: any) => {

          console.log(
            'SWAP REQUEST CREATED:',
            response
          );

          this.submitting.set(false);

          this.pendingRequestExists = true;

          this.successMessage.set(
            response?.message ||
            'Swap request created successfully.'
          );

          this.errorMessage.set('');

          setTimeout(() => {

            this.router.navigate([
              '/dashboard'
            ]);

          }, 1200);
        },

        error: (error: any) => {

          this.submitting.set(false);

          console.error(
            'CREATE SWAP REQUEST ERROR:',
            error
          );

          console.error(
            'CREATE SWAP REQUEST STATUS:',
            error?.status
          );

          console.error(
            'CREATE SWAP REQUEST BODY:',
            error?.error
          );

          console.error(
            'CREATE SWAP REQUEST MESSAGE:',
            error?.error?.message
          );

          if (error?.status === 409) {

            this.pendingRequestExists = true;

            this.errorMessage.set(
              'You already have a pending swap request for this item.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.message ||
            error?.message ||
            'Failed to create swap request. Please try again.'
          );
        }
      });
  }

  cancel(): void {

    this.router.navigate([
      '/marketplace'
    ]);
  }

  getSelectedOfferTitle(): string {

    const selectedItem =
      this.userItems().find(
        (item: any) => {

          const itemId =
            String(
              item?._id ||
              item?.id ||
              ''
            ).trim();

          return (
            itemId ===
            String(
              this.selectedOfferedItem
            ).trim()
          );
        }
      );

    return (
      selectedItem?.title ||
      'Selected item'
    );
  }
}