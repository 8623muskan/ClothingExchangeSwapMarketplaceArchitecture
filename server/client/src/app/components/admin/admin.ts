import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { ItemService } from '../../services/item';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {

  listings: any[] = [];

  filteredListings: any[] = [];

  searchTerm = '';

  selectedCategory = 'all';

  loading = false;

  errorMessage = '';

  constructor(
    private readonly itemService: ItemService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {

    this.loading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();

    console.log(
      'ADMIN: Loading marketplace listings...'
    );

    this.itemService
      .getListings()
      .subscribe({

        next: (response: any) => {

          console.log(
            'ADMIN LISTINGS RESPONSE:',
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

          this.listings = items;

          this.applyFilters();

          this.loading = false;

          console.log(
            'ADMIN LISTINGS COUNT:',
            this.listings.length
          );

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'ADMIN LISTINGS ERROR:',
            error
          );

          this.listings = [];

          this.filteredListings = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load marketplace listings.';

          this.cdr.detectChanges();
        }
      });
  }

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    this.filteredListings =
      this.listings.filter(
        (item: any) => {

          const category =
            String(
              item?.category || ''
            )
              .trim()
              .toLowerCase();

          const searchableText = [
            item?.title,
            item?.description,
            item?.brand,
            item?.category,
            item?.color,
            item?.condition,
            item?.gender,
            item?.size,
            item?.location
          ]
            .filter(
              value =>
                value !== null &&
                value !== undefined
            )
            .join(' ')
            .toLowerCase();

          const matchesSearch =
            !search ||
            searchableText.includes(search);

          const matchesCategory =
            this.selectedCategory === 'all' ||
            category ===
              this.selectedCategory
                .trim()
                .toLowerCase();

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
  }

  onSearchChange(
    value: string
  ): void {

    this.searchTerm =
      value || '';

    this.applyFilters();
  }

  onCategoryChange(
    value: string
  ): void {

    this.selectedCategory =
      value || 'all';

    this.applyFilters();
  }

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedCategory = 'all';

    this.applyFilters();
  }

  getCategories(): string[] {

    const categories =
      this.listings
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
      new Set(categories)
    ).sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }

  getActiveCount(): number {

    return this.listings.filter(
      (item: any) =>
        String(
          item?.status || 'active'
        )
          .toLowerCase()
          .trim() !== 'removed'
    ).length;
  }

  getCategoryCount(
    category: string
  ): number {

    return this.listings.filter(
      (item: any) =>
        String(
          item?.category || ''
        )
          .toLowerCase()
          .trim() ===
        category
          .toLowerCase()
          .trim()
    ).length;
  }

  getStatusLabel(
    item: any
  ): string {

    const status =
      String(
        item?.status || ''
      )
        .trim()
        .toLowerCase();

    if (!status) {
      return 'Active';
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  getStatusClass(
    item: any
  ): string {

    const status =
      String(
        item?.status || 'active'
      )
        .trim()
        .toLowerCase();

    switch (status) {

      case 'removed':
      case 'blocked':
        return 'status-danger';

      case 'pending':
      case 'review':
        return 'status-warning';

      case 'active':
      default:
        return 'status-success';
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

  trackByItemId(
    index: number,
    item: any
  ): string {

    return String(
      item?._id ||
      item?.id ||
      index
    );
  }
}