import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getCategoriesGrouped, Category } from '../../../api/categories';

interface CategoryGroup {
  parent: Category;
  children: Category[];
}

interface CategoryDialogProps {
  open: boolean;
  selectedCategories: string[];
  onClose: () => void;
  onConfirm: (categories: string[]) => void;
}

export default function CategoryDialog({
  open,
  selectedCategories,
  onClose,
  onConfirm,
}: CategoryDialogProps) {
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [flatCategories, setFlatCategories] = useState<{ id: string; displayName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTempSelectedCategories(selectedCategories.map(String));
      fetchCategories();
    }
  }, [open, selectedCategories]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const grouped: CategoryGroup[] = await getCategoriesGrouped();

      // Làm phẳng danh sách + xây dựng displayName luôn
      const flatList: { id: string; displayName: string }[] = [];

      grouped.forEach((group) => {
        // Thêm parent
        flatList.push({
          id: group.parent.id.toString(),
          displayName: group.parent.name,
        });

        // Thêm children với displayName dạng "Parent: Child"
        group.children.forEach((child) => {
          flatList.push({
            id: child.id.toString(),
            displayName: `${group.parent.name}: ${child.name}`,
          });
        });
      });

      // Sắp xếp nếu cần (ví dụ theo id hoặc tên)
      flatList.sort((a, b) => a.displayName.localeCompare(b.displayName));

      setFlatCategories(flatList);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    setTempSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClose = () => {
    setTempSelectedCategories([]);
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(tempSelectedCategories);
    setTempSelectedCategories([]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="bg-[#EAD9C9] px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="font-semibold text-lg text-[#4A3C2F]">Select Categories</h2>
          <button onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4">
          {loading && <div className="py-10 text-center">Loading...</div>}
          {error && <div className="p-4 text-red-600">{error}</div>}

          {!loading && !error && flatCategories.length === 0 && (
            <div className="py-10 text-center text-gray-500">No categories available</div>
          )}

          {!loading &&
            !error &&
            flatCategories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center py-2 cursor-pointer hover:bg-gray-50 rounded px-2"
              >
                <input
                  type="checkbox"
                  checked={tempSelectedCategories.includes(cat.id)}
                  onChange={() => handleToggleCategory(cat.id)}
                  className="mr-3 accent-[#EAD9C9] cursor-pointer"
                />
                <span>{cat.displayName}</span>
              </label>
            ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <button onClick={handleClose}>Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={tempSelectedCategories.length === 0}
            className="bg-[#8B7355] text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Confirm ({tempSelectedCategories.length})
          </button>
        </div>
      </div>
    </div>
  );
}