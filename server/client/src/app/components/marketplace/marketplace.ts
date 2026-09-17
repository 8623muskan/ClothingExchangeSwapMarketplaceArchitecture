import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ItemService } from '../../services/item';

interface MarketplaceFilters {
  search: string;
  gender: string;
  category: string;
  size: string;
  brand: string;
  condition: string;
  color: string;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.scss']
})
export class MarketplaceComponent implements OnInit {

  items: any[] = [];
  filteredItems: any[] = [];

  loading = false;
  isLoading = false;
  errorMessage = '';

  showFilters = false;

  selectedItem: any = null;

  filters: MarketplaceFilters = {
    search: '',
    gender: '',
    category: '',
    size: '',
    brand: '',
    condition: '',
    color: ''
  };

  readonly genders: string[] = [
    'Women',
    'Men',
    'Unisex',
    'Kids'
  ];

  readonly sizes: string[] = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'XXXL',
    'Free Size'
  ];

  readonly conditions: string[] = [
    'New',
    'Like New',
    'Excellent',
    'Good',
    'Fair'
  ];

  readonly colors: string[] = [
    'Black',
    'White',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Pink',
    'Purple',
    'Orange',
    'Brown',
    'Grey',
    'Beige',
    'Other'
  ];

  readonly categories: string[] = [
    'T-Shirts',
    'Shirts',
    'Jeans',
    'Trousers',
    'Dresses',
    'Jackets',
    'Sweaters',
    'Hoodies',
    'Skirts',
    'Shorts',
    'Ethnic Wear',
    'Sportswear',
    'Footwear',
    'Accessories',
    'Other'
  ];

  constructor(
    private readonly itemService: ItemService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  // =========================================================
  // LOAD MARKETPLACE
  // =========================================================

  loadItems(): void {

    this.loading = true;
    this.isLoading = true;
    this.errorMessage = '';

    this.itemService.getListings().subscribe({

      next: (response: any) => {

        console.log(
          'MARKETPLACE RESPONSE:',
          response
        );

        if (Array.isArray(response)) {

          this.items = response;

        } else if (Array.isArray(response?.data)) {

          this.items = response.data;

        } else if (Array.isArray(response?.items)) {

          this.items = response.items;

        } else {

          this.items = [];

        }

        /*
         * Apply the current filters immediately after
         * receiving the marketplace data.
         */
        this.applyFilters();

        this.loading = false;
        this.isLoading = false;

        /*
         * Force the view to refresh immediately.
         * This prevents the cards from appearing only
         * after clicking Search/Filter.
         */
        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'MARKETPLACE LOAD ERROR:',
          error
        );

        this.loading = false;
        this.isLoading = false;

        this.items = [];
        this.filteredItems = [];

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Unable to load marketplace listings.';

        this.cdr.detectChanges();
      }

    });
  }

  // =========================================================
  // MARKETPLACE SEARCH
  // =========================================================

  searchMarketplace(): void {

    this.filters.search =
      this.filters.search.trim();

    this.applyFilters();

    console.log(
      'Marketplace search:',
      this.filters.search
    );
  }

  // =========================================================
  // EXTERNAL BRAND / PRODUCT SEARCH
  // =========================================================

  searchBrandProduct(item: any): void {

    if (!item) {

      console.error(
        'Brand/product search failed: item is missing.'
      );

      return;
    }

    const title =
      String(item?.title || '').trim();

    const brand =
      String(item?.brand || '').trim();

    const brandWebsite =
      String(
        item?.brandWebsite ||
        item?.brandUrl ||
        item?.website ||
        item?.productUrl ||
        ''
      ).trim();

    /*
     * Priority 1:
     * If listing contains a brand/product website,
     * open that exact website.
     */
    if (brandWebsite) {

      const url =
        this.normalizeExternalUrl(
          brandWebsite
        );

      console.log(
        'Opening brand/product website:',
        url
      );

      window.open(
        url,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }

    /*
     * Priority 2:
     * No website was saved with the listing.
     * Search Google for the brand + product.
     */
    const searchText =
      [brand, title]
        .filter(Boolean)
        .join(' ')
        .trim();

    if (!searchText) {

      console.warn(
        'No brand or product name available for external search.'
      );

      return;
    }

    const searchUrl =
      `https://www.google.com/search?q=${encodeURIComponent(
        searchText
      )}`;

    console.log(
      'Opening external product search:',
      searchUrl
    );

    window.open(
      searchUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  private normalizeExternalUrl(
    url: string
  ): string {

    const cleanUrl =
      url.trim();

    if (
      cleanUrl.startsWith('http://') ||
      cleanUrl.startsWith('https://')
    ) {
      return cleanUrl;
    }

    return `https://${cleanUrl}`;
  }

  // =========================================================
  // FILTERS
  // =========================================================

  toggleFilters(): void {

    this.showFilters =
      !this.showFilters;
  }

  applyFilters(): void {

    const search =
      this.filters.search
        .trim()
        .toLowerCase();

    this.filteredItems =
      this.items.filter(
        (item: any) => {

          // -----------------------------------------------
          // SEARCH
          // -----------------------------------------------

          if (search) {

            const searchableText = [
              item?.title,
              item?.description,
              item?.category,
              item?.brand,
              item?.color,
              item?.gender,
              item?.size,
              item?.condition,
              item?.location
            ]
              .filter(
                (value: any) =>
                  value !== null &&
                  value !== undefined
              )
              .join(' ')
              .toLowerCase();

            if (
              !searchableText.includes(search)
            ) {
              return false;
            }
          }

          // -----------------------------------------------
          // GENDER
          // -----------------------------------------------

          if (
            this.filters.gender &&
            String(item?.gender || '')
              .toLowerCase() !==
            this.filters.gender.toLowerCase()
          ) {
            return false;
          }

          // -----------------------------------------------
          // CATEGORY
          // -----------------------------------------------

          if (
            this.filters.category &&
            String(item?.category || '')
              .toLowerCase() !==
            this.filters.category.toLowerCase()
          ) {
            return false;
          }

          // -----------------------------------------------
          // SIZE
          // -----------------------------------------------

          if (
            this.filters.size &&
            String(item?.size || '')
              .toLowerCase() !==
            this.filters.size.toLowerCase()
          ) {
            return false;
          }

          // -----------------------------------------------
          // BRAND
          // -----------------------------------------------

          if (
            this.filters.brand &&
            String(item?.brand || '')
              .toLowerCase() !==
            this.filters.brand.toLowerCase()
          ) {
            return false;
          }

          // -----------------------------------------------
          // CONDITION
          // -----------------------------------------------

          if (
            this.filters.condition &&
            String(item?.condition || '')
              .toLowerCase() !==
            this.filters.condition.toLowerCase()
          ) {
            return false;
          }

          // -----------------------------------------------
          // COLOR
          // -----------------------------------------------

          if (
            this.filters.color &&
            String(item?.color || '')
              .toLowerCase() !==
            this.filters.color.toLowerCase()
          ) {
            return false;
          }

          return true;
        }
      );
  }

  // =========================================================
  // GENDER
  // =========================================================

  selectGender(
    gender: string
  ): void {

    if (
      this.filters.gender === gender
    ) {

      this.filters.gender = '';

    } else {

      this.filters.gender = gender;
    }

    this.applyFilters();
  }

  // =========================================================
  // CATEGORY
  // =========================================================

  selectCategory(
    category: string
  ): void {

    if (
      this.filters.category === category
    ) {

      this.filters.category = '';

    } else {

      this.filters.category = category;
    }

    this.applyFilters();
  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.filters = {
      search: '',
      gender: '',
      category: '',
      size: '',
      brand: '',
      condition: '',
      color: ''
    };

    this.applyFilters();
  }

  // =========================================================
  // ACTIVE FILTERS
  // =========================================================

  get hasActiveFilters(): boolean {

    return (
      this.filters.search.trim() !== '' ||
      this.filters.gender !== '' ||
      this.filters.category !== '' ||
      this.filters.size !== '' ||
      this.filters.brand !== '' ||
      this.filters.condition !== '' ||
      this.filters.color !== ''
    );
  }

  get activeFilterCount(): number {

    let count = 0;

    if (this.filters.search.trim()) {
      count++;
    }

    if (this.filters.gender) {
      count++;
    }

    if (this.filters.category) {
      count++;
    }

    if (this.filters.size) {
      count++;
    }

    if (this.filters.brand) {
      count++;
    }

    if (this.filters.condition) {
      count++;
    }

    if (this.filters.color) {
      count++;
    }

    return count;
  }

  // =========================================================
  // CATEGORIES
  // =========================================================

  get availableCategories(): string[] {

    const categories =
      this.items
        .map(
          (item: any) =>
            String(
              item?.category || ''
            ).trim()
        )
        .filter(
          (category: string) =>
            category.length > 0
        );

    return Array.from(
      new Set([
        ...this.categories,
        ...categories
      ])
    );
  }

  // =========================================================
  // BRANDS
  // =========================================================

  get brands(): string[] {

    const brands =
      this.items
        .map(
          (item: any) =>
            String(
              item?.brand || ''
            ).trim()
        )
        .filter(
          (brand: string) =>
            brand.length > 0
        );

    return Array.from(
      new Set(brands)
    ).sort();
  }

  // =========================================================
  // ITEM SELECTION
  // =========================================================

  selectItem(
    item: any
  ): void {

    this.selectedItem = item;
  }

  isSelected(
    item: any
  ): boolean {

    if (
      !item ||
      !this.selectedItem
    ) {
      return false;
    }

    return (
      String(
        item?._id ||
        item?.id
      ) ===
      String(
        this.selectedItem?._id ||
        this.selectedItem?.id
      )
    );
  }

  // =========================================================
  // TRACKING
  // =========================================================

  trackByItem(
    index: number,
    item: any
  ): string {

    return String(
      item?._id ||
      item?.id ||
      index
    );
  }

  // =========================================================
  // IMAGE
  // =========================================================

  getImage(
    item: any
  ): string {

    const imageUrl =
      item?.imageUrl ||
      item?.image ||
      '';

    if (!imageUrl) {

      return 'assets/images/placeholder-clothing.svg';
    }

    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {

      return imageUrl;
    }

    return `http://127.0.0.1:5000${imageUrl}`;
  }

  onImageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (
      image.src.includes(
        'placeholder-clothing.svg'
      )
    ) {
      return;
    }

    image.src =
      'assets/images/placeholder-clothing.svg';
  }

  // =========================================================
  // LIST ITEM
  // =========================================================

  goToListItem(): void {

    this.router.navigate([
      '/list-item'
    ]);
  }

  // =========================================================
  // ITEM DETAILS
  // =========================================================

  viewItem(
    item: any
  ): void {

    if (!item?._id) {

      console.error(
        'Cannot open item: missing item ID',
        item
      );

      return;
    }

    this.router.navigate([
      '/item',
      item._id
    ]);
  }
}