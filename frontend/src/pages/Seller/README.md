# Create Product Page

## Overview
This is a seller product creation page that allows sellers to list their products for auction.

## Location
- **Route**: `/create-product`
- **Component**: `src/pages/Seller/CreateProduct.tsx`
- **API**: `src/api/product.ts`

## Features

### Product Information
- **Product Name**: Required field for the product title
- **Buy Now Price**: Optional field for instant purchase price
- **Categories**: Multiple category selection (at least one required)
- **Auction Dates**: Start and end date/time for the auction
- **Description**: Detailed product description (required)

### Image Management
- **Main Image**: Single large hero image (required)
  - Supports PNG, JPG formats
  - Up to 10MB file size
  - Preview before upload
  - Can be removed and re-uploaded
  
- **Additional Images**: Supporting product images
  - Minimum 3 images required
  - Maximum 10 images allowed
  - Grid preview layout
  - Individual image removal

### Available Categories
- Smartphone (iPhone, Samsung, Xiaomi, Oppo)
- Clothes (Men, Women, Kids, Accessories)
- Book (Fiction, Non-Fiction, Educational)

## Design

### Color Scheme
The page follows the application's footer color scheme:
- **Background**: `#FAF7F4` (light cream)
- **Primary**: `#8B7355` (brown)
- **Secondary**: `#EAD9C9` (beige)
- **Accent**: `#D4C4B0` (tan)
- **Text**: `#4A3C2F` (dark brown)

### Layout
- Responsive grid layout using Material-UI
- Two-column layout for images (main + additional)
- Single column for product information
- Sticky navigation with back button

## Validation

The form includes comprehensive validation:
- All required fields must be filled
- Main image is required
- Minimum 3 additional images
- End date must be after start date
- At least one category must be selected
- Description cannot be empty

## API Integration

### Endpoint
```
POST /product
Content-Type: multipart/form-data
```

### Request Format
FormData with the following fields:
- `name`: string
- `buyNowPrice`: string (optional)
- `startDate`: ISO date string
- `endDate`: ISO date string
- `description`: string
- `categories`: JSON array
- `mainImage`: File
- `additionalImage0`, `additionalImage1`, etc.: Files

### Response
Returns the created product object on success.

## Navigation

### Access Points
1. Direct URL: `/create-product`
2. Profile sidebar: "Create Product" menu item
3. After successful creation, redirects to `/my-products`

## User Flow

1. User clicks "Create Product" in profile sidebar
2. User fills in product details
3. User uploads main image and at least 3 additional images
4. User selects categories and sets auction dates
5. User writes product description
6. User clicks "Create Product"
7. Form validates all fields
8. API call is made with FormData
9. Success message is displayed
10. User is redirected to "My Products" page

## Future Enhancements

- Drag and drop for image upload
- Image cropping/editing before upload
- Draft saving functionality
- Rich text editor for description
- More category options
- Shipping information fields
- Product condition selection

