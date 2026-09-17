import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { ItemService } from '../../services/item';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule],

  template: `
    <main class="item-detail-page">

      <!-- BACK -->
      <button
        type="button"
        class="back-button"
        (click)="goBack()"
      >
        <span class="back-icon">←</span>
        <span>Back to Marketplace</span>
      </button>


      <!-- ERROR -->
      <section
        *ngIf="errorMessage() && !item()"
        class="state-card"
      >
        <div class="state-icon">!</div>

        <h2>Unable to load item</h2>

        <p>
          {{ errorMessage() }}
        </p>

        <button
          type="button"
          class="primary-button"
          (click)="goBack()"
        >
          Back to Marketplace
        </button>
      </section>


      <!-- ITEM -->
      <section
        *ngIf="item()"
        class="item-detail-card"
      >

        <!-- IMAGE -->
        <div class="image-section">

          <div class="image-frame">

            <img
              [src]="getImageUrl(item().imageUrl)"
              [alt]="item().title || 'Clothing item'"
              (error)="onImageError($event)"
            />

            <div class="image-badge">
              LISTING PHOTO
            </div>

          </div>

          <div class="image-note">
            <span class="check-icon">✓</span>
            <span>
              Verify the item details before requesting a swap.
            </span>
          </div>

        </div>


        <!-- INFORMATION -->
        <div class="content-section">

          <!-- TOP -->
          <div class="content-top">

            <div class="category">
              {{ item().category || 'CLOTHING' }}
            </div>

            <span class="availability">
              <span class="availability-dot"></span>
              Available
            </span>

          </div>


          <!-- TITLE -->
          <h1>
            {{ item().title || 'Untitled Item' }}
          </h1>

          <p class="description">
            {{
              item().description ||
              'No description provided.'
            }}
          </p>


          <!-- QUICK TAGS -->
          <div class="quick-tags">

            <span *ngIf="item().condition">
              {{ item().condition }}
            </span>

            <span *ngIf="item().size">
              Size {{ item().size }}
            </span>

            <span *ngIf="item().gender">
              {{ item().gender }}
            </span>

            <span *ngIf="item().color">
              {{ item().color }}
            </span>

          </div>


          <!-- VALUE -->
          <div class="value-card">

            <div>
              <span class="value-label">
                ESTIMATED VALUE
              </span>

              <strong>
                ₹{{ item().estimatedValue || 0 }}
              </strong>
            </div>

            <div class="value-symbol">
              ₹
            </div>

          </div>


          <!-- DETAILS -->
          <div class="details-section">

            <div class="section-title">
              <span></span>
              <h2>Item Details</h2>
            </div>


            <div class="details-grid">

              <div class="detail-item">
                <span>Category</span>
                <strong>
                  {{ item().category || 'Not specified' }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Gender</span>
                <strong>
                  {{ item().gender || 'Not specified' }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Size</span>
                <strong>
                  {{ item().size || 'Not specified' }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Brand</span>
                <strong>
                  {{ item().brand || 'Not specified' }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Condition</span>
                <strong class="condition">
                  <span></span>
                  {{ item().condition || 'Not specified' }}
                </strong>
              </div>

              <div class="detail-item">
                <span>Color</span>
                <strong>
                  {{ item().color || 'Not specified' }}
                </strong>
              </div>

              <div class="detail-item full-width">
                <span>Location</span>
                <strong>
                  {{ item().location || 'Not specified' }}
                </strong>
              </div>

            </div>

          </div>


          <!-- OWNER -->
          <div
            class="owner-card"
            *ngIf="item().owner"
          >

            <div class="owner-avatar">
              {{
                (
                  item().owner?.name ||
                  item().owner?.username ||
                  item().owner?.email ||
                  'M'
                ).charAt(0).toUpperCase()
              }}
            </div>

            <div class="owner-info">

              <span>
                LISTED BY
              </span>

              <strong>
                {{
                  item().owner?.name ||
                  item().owner?.username ||
                  item().owner?.email ||
                  'Marketplace User'
                }}
              </strong>

              <small *ngIf="item().owner?.email">
                {{ item().owner.email }}
              </small>

            </div>

            <div class="owner-check">
              ✓
            </div>

          </div>


          <!-- BRAND WEBSITE -->
          <div
            class="brand-website"
            *ngIf="item().brandWebsite"
          >

            <div>
              <span>OFFICIAL BRAND WEBSITE</span>

              <strong>
                {{ item().brand || 'Brand' }}
              </strong>
            </div>

            <button
              type="button"
              class="website-button"
              (click)="visitBrandWebsite()"
            >
              Visit Website ↗
            </button>

          </div>


          <!-- ACTIONS -->
          <div class="action-section">

            <button
              type="button"
              class="request-button"
              (click)="requestSwap()"
            >
              <span>Request Swap</span>
              <span class="button-arrow">→</span>
            </button>

            <button
              type="button"
              class="secondary-button"
              (click)="goBack()"
            >
              Back
            </button>

          </div>

        </div>

      </section>

    </main>
  `,

  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    * {
      box-sizing: border-box;
    }

    /* =====================================================
       PAGE
       ===================================================== */

    .item-detail-page {
      min-height: 100vh;
      padding: 32px 24px 70px;

      background:
        radial-gradient(
          circle at 8% 0%,
          rgba(79, 70, 229, 0.07),
          transparent 28%
        ),
        radial-gradient(
          circle at 95% 10%,
          rgba(37, 99, 235, 0.06),
          transparent 30%
        ),
        #f8f9fb;

      color: #111827;
    }


    /* =====================================================
       BACK
       ===================================================== */

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;

      width: fit-content;

      margin: 0 auto 24px;

      padding: 8px 0;

      border: 0;

      background: transparent;

      color: #374151;

      font-family: inherit;
      font-size: 13px;
      font-weight: 700;

      cursor: pointer;

      transition:
        color 0.2s ease,
        transform 0.2s ease;
    }

    .back-button:hover {
      color: #4f46e5;
      transform: translateX(-2px);
    }

    .back-icon {
      color: #4f46e5;
      font-size: 17px;
    }


    /* =====================================================
       STATE
       ===================================================== */

    .state-card {
      width: min(650px, 100%);

      margin: 70px auto;

      padding: 50px 35px;

      text-align: center;

      background: #ffffff;

      border: 1px solid #e5e7eb;

      border-radius: 20px;

      box-shadow:
        0 15px 45px rgba(17, 24, 39, 0.08);
    }

    .state-card h2 {
      margin: 18px 0 8px;

      color: #111827;

      font-size: 22px;
    }

    .state-card p {
      margin: 0 0 24px;

      color: #6b7280;

      font-size: 13px;

      line-height: 1.6;
    }

    .state-icon {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 54px;
      height: 54px;

      margin: 0 auto;

      border-radius: 50%;

      background: #fef2f2;

      border: 1px solid #fecaca;

      color: #dc2626;

      font-size: 21px;
      font-weight: 800;
    }


    /* =====================================================
       MAIN CARD
       ===================================================== */

    .item-detail-card {
      display: grid;

      grid-template-columns:
        minmax(350px, 0.95fr)
        minmax(390px, 1.05fr);

      width: min(1180px, 100%);

      margin: 0 auto;

      overflow: hidden;

      background: #ffffff;

      border: 1px solid #e5e7eb;

      border-radius: 22px;

      box-shadow:
        0 18px 55px rgba(17, 24, 39, 0.08);
    }


    /* =====================================================
       IMAGE
       ===================================================== */

    .image-section {
      padding: 26px;

      background: #f8f9fb;
    }

    .image-frame {
      position: relative;

      height: 610px;

      overflow: hidden;

      border-radius: 17px;

      background: #f1f3f5;

      border: 1px solid #e5e7eb;
    }

    .image-frame img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
    }

    .image-badge {
      position: absolute;

      left: 14px;
      bottom: 14px;

      padding: 7px 10px;

      border-radius: 7px;

      background: rgba(17, 24, 39, 0.78);

      color: #ffffff;

      font-size: 8px;
      font-weight: 800;

      letter-spacing: 1px;
    }

    .image-note {
      display: flex;
      align-items: center;

      gap: 8px;

      margin-top: 12px;

      color: #6b7280;

      font-size: 10px;

      line-height: 1.5;
    }

    .check-icon {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 19px;
      height: 19px;

      flex-shrink: 0;

      border-radius: 50%;

      background: #ecfdf3;

      color: #16a34a;

      font-size: 10px;
      font-weight: 800;
    }


    /* =====================================================
       CONTENT
       ===================================================== */

    .content-section {
      padding: 34px 36px;

      display: flex;
      flex-direction: column;

      min-width: 0;
    }

    .content-top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 15px;

      margin-bottom: 12px;
    }

    .category {
      color: #4f46e5;

      font-size: 10px;
      font-weight: 850;

      letter-spacing: 1.5px;

      text-transform: uppercase;
    }

    .availability {
      display: inline-flex;
      align-items: center;

      gap: 6px;

      padding: 6px 10px;

      border: 1px solid #bbf7d0;

      border-radius: 999px;

      background: #ecfdf3;

      color: #15803d;

      font-size: 9px;
      font-weight: 800;
    }

    .availability-dot {
      width: 6px;
      height: 6px;

      border-radius: 50%;

      background: #22c55e;
    }

    .content-section h1 {
      margin: 0;

      color: #111827;

      font-size: clamp(30px, 4vw, 43px);

      font-weight: 800;

      line-height: 1.08;

      letter-spacing: -1px;
    }

    .description {
      margin: 14px 0 20px;

      color: #6b7280;

      font-size: 12px;

      line-height: 1.7;
    }


    /* =====================================================
       TAGS
       ===================================================== */

    .quick-tags {
      display: flex;
      flex-wrap: wrap;

      gap: 7px;

      margin-bottom: 20px;
    }

    .quick-tags > span {
      padding: 7px 10px;

      border: 1px solid #e5e7eb;

      border-radius: 7px;

      background: #f8f9fb;

      color: #4b5563;

      font-size: 9px;
      font-weight: 700;
    }


    /* =====================================================
       VALUE
       ===================================================== */

    .value-card {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 24px;

      padding: 16px 18px;

      border: 1px solid rgba(79, 70, 229, 0.13);

      border-radius: 13px;

      background:
        linear-gradient(
          110deg,
          rgba(79, 70, 229, 0.07),
          rgba(37, 99, 235, 0.035)
        );
    }

    .value-card > div:first-child {
      display: flex;
      flex-direction: column;

      gap: 4px;
    }

    .value-label {
      color: #6b7280;

      font-size: 8px;
      font-weight: 800;

      letter-spacing: 1px;
    }

    .value-card strong {
      color: #4f46e5;

      font-size: 24px;
      font-weight: 800;
    }

    .value-symbol {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 39px;
      height: 39px;

      border-radius: 10px;

      background: rgba(79, 70, 229, 0.09);

      color: #4f46e5;

      font-size: 16px;
      font-weight: 800;
    }


    /* =====================================================
       DETAILS
       ===================================================== */

    .details-section {
      margin-bottom: 20px;
    }

    .section-title {
      display: flex;
      align-items: center;

      gap: 9px;

      margin-bottom: 12px;
    }

    .section-title > span {
      width: 18px;
      height: 2px;

      border-radius: 5px;

      background: #4f46e5;
    }

    .section-title h2 {
      margin: 0;

      color: #1f2937;

      font-size: 12px;
      font-weight: 800;
    }

    .details-grid {
      display: grid;

      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      border-top: 1px solid #eef0f3;
    }

    .detail-item {
      display: flex;
      flex-direction: column;

      gap: 4px;

      min-height: 57px;

      padding: 10px 12px;

      border-bottom: 1px solid #eef0f3;
    }

    .detail-item:nth-child(odd) {
      border-right: 1px solid #eef0f3;
    }

    .detail-item span:first-child {
      color: #9ca3af;

      font-size: 8px;
      font-weight: 700;

      text-transform: uppercase;

      letter-spacing: 0.7px;
    }

    .detail-item strong {
      color: #374151;

      font-size: 10px;
      font-weight: 750;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;

      border-right: 0;
    }

    .condition {
      display: flex;
      align-items: center;

      gap: 6px;

      color: #15803d !important;
    }

    .condition span {
      width: 5px;
      height: 5px;

      border-radius: 50%;

      background: #22c55e;
    }


    /* =====================================================
       OWNER
       ===================================================== */

    .owner-card {
      display: flex;
      align-items: center;

      gap: 11px;

      margin-bottom: 16px;

      padding: 12px 13px;

      border: 1px solid #e5e7eb;

      border-radius: 12px;

      background: #fafafa;
    }

    .owner-avatar {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 38px;
      height: 38px;

      flex-shrink: 0;

      border-radius: 10px;

      background:
        linear-gradient(
          135deg,
          #2563eb,
          #4f46e5
        );

      color: #ffffff;

      font-size: 14px;
      font-weight: 800;
    }

    .owner-info {
      display: flex;
      flex-direction: column;

      gap: 2px;

      min-width: 0;
    }

    .owner-info > span {
      color: #9ca3af;

      font-size: 7px;
      font-weight: 800;

      letter-spacing: 1px;
    }

    .owner-info strong {
      overflow: hidden;

      color: #1f2937;

      font-size: 10px;

      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .owner-info small {
      overflow: hidden;

      color: #6b7280;

      font-size: 8px;

      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .owner-check {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 22px;
      height: 22px;

      margin-left: auto;

      border-radius: 50%;

      background: #ecfdf3;

      color: #16a34a;

      font-size: 9px;
      font-weight: 800;
    }


    /* =====================================================
       BRAND WEBSITE
       ===================================================== */

    .brand-website {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 12px;

      margin-bottom: 16px;

      padding: 12px 13px;

      border: 1px solid #e5e7eb;

      border-radius: 12px;

      background: #fafafa;
    }

    .brand-website > div {
      display: flex;
      flex-direction: column;

      gap: 3px;
    }

    .brand-website span {
      color: #9ca3af;

      font-size: 7px;
      font-weight: 800;

      letter-spacing: 0.8px;
    }

    .brand-website strong {
      color: #374151;

      font-size: 10px;
    }

    .website-button {
      flex-shrink: 0;

      border: 0;

      border-radius: 8px;

      padding: 9px 12px;

      background: #111827;

      color: #ffffff;

      font-family: inherit;

      font-size: 9px;
      font-weight: 750;

      cursor: pointer;

      transition:
        background 0.2s ease,
        transform 0.2s ease;
    }

    .website-button:hover {
      background: #374151;

      transform: translateY(-1px);
    }


    /* =====================================================
       ACTIONS
       ===================================================== */

    .action-section {
      display: flex;

      gap: 9px;

      margin-top: auto;
    }

    .request-button {
      flex: 1;

      display: flex;
      align-items: center;
      justify-content: center;

      gap: 10px;

      min-height: 48px;

      border: 0;

      border-radius: 10px;

      background:
        linear-gradient(
          135deg,
          #2563eb,
          #4f46e5
        );

      color: #ffffff;

      font-family: inherit;

      font-size: 11px;
      font-weight: 800;

      cursor: pointer;

      box-shadow:
        0 8px 20px rgba(79, 70, 229, 0.22);

      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }

    .request-button:hover {
      transform: translateY(-1px);

      box-shadow:
        0 12px 26px rgba(79, 70, 229, 0.30);
    }

    .button-arrow {
      font-size: 16px;

      transition:
        transform 0.2s ease;
    }

    .request-button:hover .button-arrow {
      transform: translateX(3px);
    }

    .secondary-button {
      min-width: 82px;

      min-height: 48px;

      padding: 0 16px;

      border: 1px solid #d1d5db;

      border-radius: 10px;

      background: #ffffff;

      color: #374151;

      font-family: inherit;

      font-size: 10px;
      font-weight: 700;

      cursor: pointer;

      transition:
        background 0.2s ease,
        border-color 0.2s ease;
    }

    .secondary-button:hover {
      background: #f3f4f6;

      border-color: #9ca3af;
    }

    .primary-button {
      padding: 12px 20px;

      border: 0;

      border-radius: 10px;

      background:
        linear-gradient(
          135deg,
          #2563eb,
          #4f46e5
        );

      color: #ffffff;

      font-family: inherit;

      font-size: 11px;
      font-weight: 800;

      cursor: pointer;
    }


    /* =====================================================
       TABLET
       ===================================================== */

    @media (max-width: 950px) {

      .item-detail-card {
        grid-template-columns: 1fr;
      }

      .image-frame {
        height: 500px;
      }

      .content-section {
        padding: 30px;
      }
    }


    /* =====================================================
       MOBILE
       ===================================================== */

    @media (max-width: 600px) {

      .item-detail-page {
        padding: 20px 12px 45px;
      }

      .item-detail-card {
        border-radius: 18px;
      }

      .image-section {
        padding: 16px;
      }

      .image-frame {
        height: 390px;
      }

      .content-section {
        padding: 22px 18px;
      }

      .content-top {
        align-items: flex-start;
        flex-direction: column;
      }

      .content-section h1 {
        font-size: 31px;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .detail-item:nth-child(odd) {
        border-right: 0;
      }

      .detail-item.full-width {
        grid-column: auto;
      }

      .brand-website {
        align-items: stretch;
        flex-direction: column;
      }

      .website-button {
        width: 100%;
      }

      .action-section {
        flex-direction: column;
      }

      .request-button,
      .secondary-button {
        width: 100%;
      }
    }
  `]
})
export class ItemDetailComponent implements OnInit {

  readonly item = signal<any | null>(null);

  readonly errorMessage = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly itemService: ItemService
  ) {}

  ngOnInit(): void {

    const itemId =
      this.route.snapshot.paramMap.get('id');

    if (!itemId) {
      this.errorMessage.set(
        'Item ID is missing.'
      );
      return;
    }

    console.log(
      'ITEM DETAIL ID:',
      itemId
    );

    this.loadItem(itemId);
  }

  private loadItem(
    itemId: string
  ): void {

    this.errorMessage.set('');

    this.itemService
      .getItemById(itemId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'ITEM DETAIL RESPONSE:',
            response
          );

          const receivedItem =
            response?.data ??
            response ??
            null;

          if (!receivedItem) {

            this.item.set(null);

            this.errorMessage.set(
              'Clothing item not found.'
            );

            return;
          }

          this.item.set(receivedItem);

          this.errorMessage.set('');

          console.log(
            'ITEM DETAIL SIGNAL UPDATED:',
            this.item()
          );
        },

        error: (error: any) => {

          console.error(
            'ITEM DETAIL LOAD ERROR:',
            error
          );

          this.item.set(null);

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to load clothing item.'
          );
        }
      });
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
      value.startsWith('/')
    ) {
      return `http://127.0.0.1:5000${value}`;
    }

    return `http://127.0.0.1:5000/${value}`;
  }

  onImageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (
      image.dataset['fallback']
    ) {
      return;
    }

    image.dataset['fallback'] =
      'true';

    image.src =
      'assets/images/placeholder-clothing.svg';
  }

  visitBrandWebsite(): void {

    const currentItem =
      this.item();

    if (
      !currentItem?.brandWebsite
    ) {
      return;
    }

    let website =
      String(
        currentItem.brandWebsite
      ).trim();

    if (!website) {
      return;
    }

    if (
      !/^https?:\/\//i.test(website)
    ) {
      website =
        `https://${website}`;
    }

    try {

      const url =
        new URL(website);

      if (
        url.protocol !== 'http:' &&
        url.protocol !== 'https:'
      ) {
        return;
      }

      window.open(
        url.toString(),
        '_blank',
        'noopener,noreferrer'
      );

    } catch (error) {

      console.error(
        'BRAND WEBSITE: Invalid URL',
        error
      );
    }
  }

  isOwnItem(): boolean {
  const currentItem = this.item();

  if (!currentItem) {
    return false;
  }

  const owner =
    currentItem.owner;

  const ownerId =
    owner && typeof owner === 'object'
      ? (
          owner?._id ||
          owner?.id ||
          ''
        )
      : owner || '';

  const storedUser =
    localStorage.getItem('user');

  if (!storedUser) {
    return false;
  }

  try {
    const user =
      JSON.parse(storedUser);

    const currentUserId =
      user?._id ||
      user?.id ||
      '';

    return (
      String(ownerId).trim() !== '' &&
      String(currentUserId).trim() !== '' &&
      String(ownerId).trim() ===
        String(currentUserId).trim()
    );

  } catch (error) {
    console.error(
      'ITEM DETAIL USER CHECK ERROR:',
      error
    );

    return false;
  }
}

  requestSwap(): void {

    const currentItem =
      this.item();

    if (
      !currentItem?._id
    ) {

      console.error(
        'Cannot request swap: item ID missing.'
      );

      return;
    }

    console.log(
      'Swap requested for item:',
      currentItem._id
    );

    this.router.navigate(
      ['/swap/request'],
      {
        queryParams: {
          itemId: currentItem._id
        }
      }
    );
  }

  goBack(): void {

    this.router.navigate([
      '/marketplace'
    ]);
  }
}