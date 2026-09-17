import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { ItemService } from '../../services/item';

@Component({
  selector: 'app-list-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './list-item.html',
  styleUrls: ['./list-item.scss']
})
export class ListItemComponent {

  listingForm: FormGroup;

  selectedFile: File | null = null;
  imagePreview = '';

  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  readonly categories = [
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

  readonly sizes = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'XXXL',
    'Free Size'
  ];

  readonly conditions = [
    'New',
    'Like New',
    'Excellent',
    'Good',
    'Fair'
  ];

  readonly genders = [
    'Women',
    'Men',
    'Unisex',
    'Kids'
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly itemService: ItemService,
    private readonly cdr: ChangeDetectorRef,
    readonly router: Router
  ) {
    this.listingForm = this.fb.group({

      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      description: [
        '',
        Validators.maxLength(2000)
      ],

      category: [
        '',
        Validators.required
      ],

      size: [
        '',
        Validators.required
      ],

      brand: [
        '',
        Validators.maxLength(100)
      ],

      brandWebsite: [
        '',
        Validators.maxLength(500)
      ],

      condition: [
        'Good',
        Validators.required
      ],

      gender: [
        'Unisex',
        Validators.required
      ],

      color: [
        '',
        Validators.maxLength(50)
      ],

      location: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      estimatedValue: [
        '',
        Validators.min(0)
      ]

    });
  }

  get title() {
    return this.listingForm.get('title');
  }

  get description() {
    return this.listingForm.get('description');
  }

  get category() {
    return this.listingForm.get('category');
  }

  get size() {
    return this.listingForm.get('size');
  }

  get brand() {
    return this.listingForm.get('brand');
  }

  get brandWebsite() {
    return this.listingForm.get('brandWebsite');
  }

  get location() {
    return this.listingForm.get('location');
  }

  get estimatedValue() {
    return this.listingForm.get('estimatedValue');
  }

  // =========================================================
  // IMAGE SELECTION
  // =========================================================

  onFileSelected(
    event: Event
  ): void {

    this.errorMessage = '';
    this.successMessage = '';

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedFile = null;
      this.imagePreview = '';

      this.cdr.detectChanges();

      return;
    }

    const file =
      input.files[0];

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      this.selectedFile = null;
      this.imagePreview = '';

      this.errorMessage =
        'Invalid image format. Please upload JPG, JPEG, PNG, or WEBP.';

      input.value = '';

      this.cdr.detectChanges();

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {

      this.selectedFile = null;
      this.imagePreview = '';

      this.errorMessage =
        'Image size must be 5 MB or smaller.';

      input.value = '';

      this.cdr.detectChanges();

      return;
    }

    this.selectedFile = file;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        typeof reader.result === 'string'
          ? reader.result
          : '';

      /*
       * FileReader finishes outside the normal
       * synchronous component update cycle.
       * Force Angular to render the new preview.
       */
      this.cdr.detectChanges();
    };

    reader.onerror = () => {

      this.selectedFile = null;
      this.imagePreview = '';

      this.errorMessage =
        'Unable to preview the selected image.';

      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  removeImage(): void {

    this.selectedFile = null;
    this.imagePreview = '';

    const fileInput =
      document.getElementById(
        'clothingImage'
      ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }

    this.cdr.detectChanges();
  }

  // =========================================================
  // WEBSITE NORMALIZATION
  // =========================================================

  normalizeWebsite(
    value: unknown
  ): string {

    const website =
      String(value ?? '').trim();

    if (!website) {
      return '';
    }

    if (
      website.startsWith('http://') ||
      website.startsWith('https://')
    ) {
      return website;
    }

    return `https://${website}`;
  }

  // =========================================================
  // SUBMIT LISTING
  // =========================================================

  submitListing(): void {

    this.successMessage = '';
    this.errorMessage = '';

    if (
      this.listingForm.invalid
    ) {

      this.listingForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required fields.';

      this.cdr.detectChanges();

      return;
    }

    if (!this.selectedFile) {

      this.errorMessage =
        'Please select a clothing image.';

      this.cdr.detectChanges();

      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const formValue =
      this.listingForm.getRawValue();

    const formData =
      new FormData();

    formData.append(
      'title',
      String(
        formValue.title ?? ''
      ).trim()
    );

    formData.append(
      'description',
      String(
        formValue.description ?? ''
      ).trim()
    );

    formData.append(
      'category',
      String(
        formValue.category ?? ''
      ).trim()
    );

    formData.append(
      'size',
      String(
        formValue.size ?? ''
      ).trim()
    );

    formData.append(
      'brand',
      String(
        formValue.brand ?? ''
      ).trim()
    );

    formData.append(
      'brandWebsite',
      this.normalizeWebsite(
        formValue.brandWebsite
      )
    );

    formData.append(
      'condition',
      String(
        formValue.condition ?? ''
      ).trim()
    );

    formData.append(
      'gender',
      String(
        formValue.gender ?? ''
      ).trim()
    );

    formData.append(
      'color',
      String(
        formValue.color ?? ''
      ).trim()
    );

    formData.append(
      'location',
      String(
        formValue.location ?? ''
      ).trim()
    );

    if (
      formValue.estimatedValue !== null &&
      formValue.estimatedValue !== undefined &&
      String(
        formValue.estimatedValue
      ).trim() !== ''
    ) {

      formData.append(
        'estimatedValue',
        String(
          formValue.estimatedValue
        )
      );
    }

    /*
     * Backend multer expects the field name "image".
     */
    formData.append(
      'image',
      this.selectedFile,
      this.selectedFile.name
    );

    console.log(
      '================================'
    );

    console.log(
      'CREATING CLOTHING ITEM'
    );

    console.log(
      'IMAGE:',
      this.selectedFile.name
    );

    console.log(
      'TYPE:',
      this.selectedFile.type
    );

    console.log(
      'SIZE:',
      this.selectedFile.size
    );

    console.log(
      '================================'
    );

    this.itemService
      .createListing(formData)
      .subscribe({

        next: (
          response: any
        ) => {

          console.log(
            'LISTING CREATED:',
            response
          );

          this.isSubmitting = false;

          this.successMessage =
            response?.message ||
            'Clothing item listed successfully.';

          this.listingForm.reset({
            condition: 'Good',
            gender: 'Unisex'
          });

          this.removeImage();

          this.cdr.detectChanges();

          setTimeout(() => {

            this.router.navigate([
              '/marketplace'
            ]);

          }, 1000);
        },

        error: (
          error: any
        ) => {

          console.error(
            'CREATE LISTING ERROR:',
            error
          );

          this.isSubmitting = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to create the clothing listing.';

          this.cdr.detectChanges();
        }

      });
  }
}