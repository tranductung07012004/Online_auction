# Zustand Stores - Flux Pattern Implementation

## Overview
This project uses Zustand for centralized state management following the Flux pattern (unidirectional data flow).

## Architecture

### Data Flow
```
URL → Store → Components
     ↑         ↓
     └─────────┘ (via navigation)
```

1. **URL → Store**: When URL changes (navigation), stores sync from URL
2. **Store → Components**: Components read from stores
3. **Components → Store**: User actions update stores
4. **Store → URL**: Store updates trigger navigation to update URL

## Stores

### `searchStore.ts`
Manages search query and filter state.

**State:**
- `searchQuery`: string - Current search query
- `filters`: object - Current filters (category, sort, endTime)

**Actions:**
- `setSearchQuery(query)`: Update search query
- `setFilters(filters)`: Replace all filters
- `updateFilters(partialFilters)`: Merge new filters with existing
- `resetFilters()`: Reset all filters to initial state

### `navigationStore.ts`
Manages navigation UI state.

**State:**
- `drawerOpen`: boolean - Whether drawer menu is open

**Actions:**
- `setDrawerOpen(open)`: Set drawer open/closed
- `toggleDrawer()`: Toggle drawer state

## Hooks

### `useSearchSync`
Syncs search store with URL parameters. Should be called in components that need URL sync.

**Usage:**
```tsx
const MyComponent = () => {
  useSearchSync(); // Syncs store with URL
  const { searchQuery, filters } = useSearchStore();
  // ...
};
```

## Usage Example

### In Header Component
```tsx
import { useSearchStore, useNavigationStore } from '../stores';
import { useSearchSync } from '../hooks/useSearchSync';

const Header = () => {
  // Sync store with URL
  useSearchSync();
  
  // Read from stores
  const { searchQuery, filters, setSearchQuery } = useSearchStore();
  const { drawerOpen, setDrawerOpen } = useNavigationStore();
  
  // Update stores (triggers navigation)
  const handleSearch = () => {
    // Update store
    setSearchQuery(query);
    // Navigate (Store -> URL)
    navigate(`/pcp?q=${query}`);
  };
};
```

## Best Practices

1. **Single Source of Truth**: Always read state from stores, not local state
2. **Unidirectional Flow**: 
   - User action → Update store → Navigate to update URL
   - URL change → Sync store → Components re-render
3. **No Direct URL Manipulation**: Always update stores first, then navigate
4. **Store Actions**: Use store actions to update state, not direct state mutation

## Future Stores

When ready to add product management:
- `productStore.ts`: Product list, selected product, product filters
- `cartStore.ts`: Cart items, cart operations
- `userStore.ts`: User preferences, settings

