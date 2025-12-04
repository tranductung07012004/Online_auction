# SearchBar Component

Component search bar có thể tái sử dụng với filter panel tích hợp.

## Tính năng

- ✅ Search input với placeholder tùy chỉnh
- ✅ Filter panel với categories và subcategories
- ✅ Sort options (price, rating, end time)
- ✅ Tích hợp với Zustand store
- ✅ Responsive design
- ✅ Material-UI styling

## Cấu trúc

```
src/components/SearchBar/
├── SearchBar.tsx       # Component chính
├── index.ts           # Export file
└── README.md          # Documentation này
```

## Cách sử dụng

### 1. Import component

```typescript
import { SearchBar, MenuItem } from '../components/SearchBar';
```

### 2. Chuẩn bị menu items

```typescript
const menuItems: MenuItem[] = [
  { 
    text: 'Home', 
    icon: <HomeIcon />, 
    path: '/'
  },
  { 
    text: 'Smartphone', 
    icon: <SmartPhoneIcon />, 
    path: '/pcp',
    subcategories: [
      { text: 'iPhone', value: 'iphone' },
      { text: 'Samsung', value: 'samsung' },
    ]
  },
];
```

### 3. Sử dụng trong component

```typescript
import { useSearchStore } from '../stores';
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  const { searchQuery, filters, setSearchQuery, updateFilters } = useSearchStore();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build URL with search params
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    if (filters.category) params.set('category', filters.category);
    navigate(`/search?${params.toString()}`);
  };

  const handleFilterSelect = (newFilters) => {
    updateFilters(newFilters);
    // Navigate or trigger search
  };

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      menuItems={menuItems}
      onFilterSelect={handleFilterSelect}
      placeholder="Search products..."  // Optional
      maxWidth={{ xs: '100%', md: '800px' }}  // Optional
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `searchQuery` | string | ✅ | Current search query value |
| `onSearchChange` | (value: string) => void | ✅ | Handler khi search input thay đổi |
| `onSearchSubmit` | (e: React.FormEvent) => void | ✅ | Handler khi submit form |
| `menuItems` | MenuItem[] | ✅ | Danh sách menu items cho filter |
| `onFilterSelect` | (filters) => void | ✅ | Handler khi apply filters |
| `placeholder` | string | ❌ | Placeholder text (default: "Search for product name") |
| `maxWidth` | object | ❌ | Max width responsive (default: { xs: '400px', md: '600px' }) |

## Types

```typescript
interface SubCategory {
  text: string;
  value: string;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  subcategories?: SubCategory[];
}
```

## Ví dụ sử dụng trong trang PCP

Xem file `src/pages/PCP/pcp/PCPSearchBar.tsx` để có ví dụ hoàn chỉnh về cách tích hợp SearchBar vào trang PCP.

## Tích hợp với Zustand Store

Component này tự động tích hợp với `useSearchStore` để:
- Đồng bộ filters với URL parameters
- Reset filters
- Update filters

Store structure:

```typescript
interface SearchState {
  searchQuery: string;
  filters: {
    category?: string;
    subcategory?: string;
    sort?: string;
    endTime?: boolean;
  };
  setSearchQuery: (query: string) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}
```

## Styling

Component sử dụng Material-UI với theme colors:
- Primary color: `#C3937C` (nâu pastel)
- Background: `#fdfcf9` (kem nhạt)
- Border: `#EAEAEA` (xám nhạt)

Có thể customize thông qua Material-UI `sx` props nếu cần.

## Refactoring từ header.tsx

Component này được tách ra từ `header.tsx` để:
1. ✅ Giảm độ dài của header.tsx (từ 989 dòng xuống ~520 dòng)
2. ✅ Tái sử dụng được ở nhiều trang (Header, PCP, Search...)
3. ✅ Dễ maintain và test
4. ✅ Single Responsibility Principle

## Lưu ý

- Component này yêu cầu Material-UI và MUI Icons
- Cần setup Zustand store trước khi sử dụng
- Filter panel responsive trên mobile và desktop



