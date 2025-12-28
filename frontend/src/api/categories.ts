import api from "./apiClient";
export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface CategoryPageResponse {
  content: Category[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

/**
 * Fetch all categories (non-paginated)
 */
export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await api.get<ApiResponse<Category[]>>(
    "/api/main/categories"
  );
  return response.data;
};

/**
 * Fetch all parent categories (categories with parent_id = null)
 */
export const getParentCategories = async (): Promise<any> => {
  const response = await api.get("/api/main/categories/search-norm-parent", {
    params: {
      name: "",
      page: 0,
      size: 1000,
    },
  });

  return response.data;
};

/**
 * Fetch all child categories (categories with parent_id != null)
 */
export const getChildCategories = async (): Promise<any> => {
  const response = await api.get("/api/main/categories/search-norm-child", {
    params: {
      name: "",
      page: 0,
      size: 1000,
    },
  });

  return response.data;
};

/**
 * Fetch all categories and match parent with children
 * Returns categories grouped by parent
 */
export const getCategoriesGrouped = async (): Promise<
  Array<{
    parent: Category;
    children: Category[];
  }>
> => {
  try {
    const [parentResult, childResult] = await Promise.all([
      getParentCategories(),
      getChildCategories(),
    ]);

    const parents = parentResult.data.content as Category[];
    const children = childResult.data.content as Category[];

    // Match children to parents
    const grouped = parents.map((parent) => ({
      parent,
      children: children.filter((child) => child.parent_id === parent.id),
    }));

    return grouped;
  } catch (error) {
    console.error("Error fetching grouped categories:", error);
    throw error;
  }
};
