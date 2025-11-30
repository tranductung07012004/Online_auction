# New Home Page Structure

This directory contains the new home page design based on the e-commerce fashion UI.

## File Structure

```
Home/
├── HomeNew.tsx                    # Main new home page component
├── sections-new/                  # New section components
│   ├── FamilyBannerSection.tsx   # Top banner with family winter jacket promotion
│   ├── FlashSaleSection.tsx      # Flash sale products section (50% discount)
│   ├── WinterJacketSection.tsx   # Winter jacket collection section
│   └── HeatRetainingSection.tsx  # Heat-retaining clothing section
├── components-new/                # New reusable components
│   └── ProductCard.tsx           # Product card component with image, price, colors
├── sections/                      # Original sections (preserved)
└── components/                    # Original components (preserved)
```

## Sections Overview

### 1. FamilyBannerSection
- Large promotional banner for family winter jackets
- Left side: Text content with call-to-action button
- Right side: Hero image
- Gradient blue background

### 2. FlashSaleSection
- "SĂN SALE" header with "GIẢM ~ 50%" badge
- Grid of product cards with discount badges
- Cream/beige background

### 3. WinterJacketSection
- "ÁO PHAO 4.5" header
- Two banner images at the top
- Grid of winter jacket product cards
- "Xem thêm" (View more) button at bottom
- White background

### 4. HeatRetainingSection
- "ÁO GIỮ NHIỆT" header with heat icon
- Subtitle: "Ấm áp mọi nơi - Tự tin mọi lúc"
- Grid of thermal clothing product cards
- Cream/beige background

## Components

### ProductCard
Reusable product card component with:
- Product image
- Discount badge (top-left)
- Product name (2 lines max)
- Current price (red) and original price (strikethrough)
- Color options (circular swatches)
- Hover effects (lift and shadow)

## How to Use

### View the new home page:
Navigate to `/home-new` in your browser

### View the original home page:
Navigate to `/` in your browser

## Technologies Used

- **Material-UI (MUI)**: For UI components, layout, and styling
- **React**: Component framework
- **TypeScript**: Type safety
- **Placeholder Images**: Using via.placeholder.com for demo purposes

## Customization

### Replace placeholder images:
1. Replace image URLs in each section component
2. Update product data arrays with real product information

### Modify colors:
- Primary color: `#E53935` (red for discounts)
- Secondary color: `#1976D2` (blue for buttons)
- Accent color: `#FF6F00` (orange for CTAs)
- Background colors: `#FFF8F0` (cream), `white`

### Update content:
- Edit product arrays in section components
- Modify text content in banner sections
- Adjust spacing and layout in MUI `sx` props

## Future Enhancements

- Connect to real product API
- Add product filtering and sorting
- Implement add to cart functionality
- Add product detail navigation
- Implement responsive grid breakpoints
- Add loading states and error handling

