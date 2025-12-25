import { CategoryGroup } from './types';

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    parent: 'smartphone',
    label: 'Smartphone',
    children: [
      { value: 'iphone', label: 'iPhone' },
      { value: 'samsung', label: 'Samsung' },
      { value: 'xiaomi', label: 'Xiaomi' },
      { value: 'oppo', label: 'Oppo' },
    ],
  },
  {
    parent: 'clothes',
    label: 'Clothes',
    children: [
      { value: 'men', label: 'Men' },
      { value: 'women', label: 'Women' },
      { value: 'kids', label: 'Kids' },
      { value: 'accessories', label: 'Accessories' },
    ],
  },
  {
    parent: 'book',
    label: 'Book',
    children: [
      { value: 'fiction', label: 'Fiction' },
      { value: 'non-fiction', label: 'Non-Fiction' },
      { value: 'educational', label: 'Educational' },
    ],
  },
];

export const getCategoryLabel = (value: string, categoryGroups: CategoryGroup[]): string => {
  for (const group of categoryGroups) {
    if (group.parent === value) return group.label;
    const child = group.children.find((c) => c.value === value);
    if (child) return child.label;
  }
  return value;
};








