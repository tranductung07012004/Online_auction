# Bidder Management Component

## Overview
The Bidder Management component allows sellers to manage who can participate in bidding for their auction products. This component is displayed on the Product Detail Page (PDP) and is only visible to the product seller.

## Features

### 1. Two-Tab Management System

#### Tab 1: Reviewed Bidders (Đã đánh giá)
- Displays bidders who have been previously reviewed by the seller or other sellers
- Shows review status (positive/negative feedback)
- Allows seller to block bidders with negative history
- Displays review text when hovering over the review chip

#### Tab 2: Unreviewed Bidders (Chưa đánh giá)
- Displays bidders who have never been reviewed
- Allows seller to approve or block these bidders
- Useful for managing new or unknown bidders

### 2. Actions

#### Block Bidder
- Click the block icon (🚫) to prevent a bidder from participating in the auction
- Optional: Add a reason for blocking
- Blocked bidders cannot place bids on this product

#### Allow Bidder
- Click the checkmark icon (✓) to allow a previously blocked bidder to participate
- Instantly restores bidding permissions for that user

### 3. Information Displayed

For each bidder, the following information is shown:
- **Avatar & Name**: User's profile picture and full name
- **Username**: @username for identification
- **Bid Amount**: The amount they bid (in VND)
- **Bid Time**: When they placed their bid
- **Bid Count**: Number of times they've placed bids on this product
- **Review Status** (for reviewed bidders): Positive (👍) or Negative (👎) feedback
- **Status**: Blocked or Active
- **Actions**: Block or Allow button

## Design

### Color Scheme
The component follows the website's color palette:
- Primary Color: `#EAD9C9` (beige/tan)
- Accent Color: `#c3937c` (bronze/tan)
- Text Color: `#333333` (dark gray)
- Success Color: `#2e7d32` (green)
- Error Color: `#c62828` (red)
- Background: `#f9fafb` (light gray)

### Material-UI Components
The component uses MUI components for a consistent, modern look:
- `Tabs` & `Tab` for navigation
- `Table` for bidder list
- `Dialog` for confirmation modals
- `Chip` for status indicators
- `Avatar` for user profiles
- `IconButton` for actions
- `Alert` for informational messages

## API Integration

### Endpoints Used

1. **GET** `/product/:productId/bidders`
   - Fetches all bidders for a product
   - Returns array of bidder objects with review information

2. **POST** `/product/:productId/block-bidder`
   - Blocks a bidder from the product
   - Body: `{ bidderId: string, reason?: string }`

3. **POST** `/product/:productId/allow-bidder`
   - Allows a blocked bidder to participate
   - Body: `{ bidderId: string }`

### Data Structure

```typescript
interface Bidder {
  id: string;
  username: string;
  fullname: string;
  avatar: string;
  email: string;
  bidAmount: number;
  bidAt: string;
  bidCount: number;
  hasReview: boolean;
  reviewType?: 'like' | 'dislike';
  reviewText?: string;
  isBlocked?: boolean;
}
```

## Usage

### In PDP Component

```tsx
import BidderManagement from './pdp/bidder-management';

// Inside component
{isSeller && productId && (
  <div className="mt-16">
    <BidderManagement 
      productId={productId} 
      isSeller={isSeller} 
    />
  </div>
)}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `productId` | `string` | Yes | The ID of the product |
| `isSeller` | `boolean` | Yes | Whether the current user is the seller |

## Accessibility

- Keyboard navigation supported
- Screen reader friendly
- Tooltips for icon-only buttons
- High contrast colors for readability
- Loading states for async operations

## Responsive Design

- Works on desktop, tablet, and mobile devices
- Table scrolls horizontally on smaller screens
- Dialog modals are responsive
- Touch-friendly button sizes

## Error Handling

- Graceful fallback to fake data if API fails (for development)
- Toast notifications for user feedback
- Loading states during operations
- Error messages in dialog modals

## Future Enhancements

1. Bulk actions (block/allow multiple bidders at once)
2. Export bidder list to CSV
3. Search and filter bidders
4. Sort by bid amount, time, or status
5. Bidder history view (all products they've bid on)
6. Email notifications when blocking/allowing bidders

