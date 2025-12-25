export interface ProductFormData {
  name: string;
  startPrice: string;
  minimumBidStep: string;
  buyNowPrice: string;
  endDate: string;
  description: string;
  categories: string[];
  autoExtendEnabled: boolean;
  mainImage: File | null;
  additionalImages: File[];
}

export interface CategoryGroup {
  parent: string;
  label: string;
  children: Array<{ value: string; label: string }>;
}

