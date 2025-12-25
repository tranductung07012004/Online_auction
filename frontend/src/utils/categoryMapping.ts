/**
 * Convert category string IDs to integer IDs
 * Categories are now fetched from API and stored as string IDs
 * @param categoryStrings - Array of category string IDs (e.g., ["1", "2", "3"])
 * @returns Array of category integer IDs
 */
export const mapCategoriesToIds = (categoryStrings: string[]): number[] => {
  return categoryStrings
    .map((cat) => {
      const id = parseInt(cat, 10);
      return isNaN(id) ? null : id;
    })
    .filter((id): id is number => id !== null);
};


