import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CartItem } from './types';
import { submitReview, ReviewSubmission } from '../../api/dress';
import { useAuth } from '../../context/AuthContext';

interface ProductReview {
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  reviewText: string;
  isReviewed: boolean;
}

const PaymentReview: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  const [reviews, setReviews] = useState<Map<number, ProductReview>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Use fake data for UI preview
    const fakeItems: CartItem[] = [
      {
        name: 'Elegant Wedding Dress',
        image: '/pic1.jpg',
        quantity: 1,
        dressId: 'demo-dress-1',
        sizeName: 'M',
        colorName: 'Ivory',
        pricePerDay: 80,
        startDate: new Date(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Classic White Gown',
        image: '/pic2.jpg',
        quantity: 1,
        dressId: 'demo-dress-2',
        sizeName: 'L',
        colorName: 'White',
        pricePerDay: 90,
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ];

    setCartItems(fakeItems);
    // Auto-select all items
    setSelectedItemIds(new Set(fakeItems.map((_, index) => index)));
    
    // Initialize reviews map
    const reviewsMap = new Map<number, ProductReview>();
    fakeItems.forEach((item, index) => {
      if (!item.isPhotographyService && item.dressId) {
        reviewsMap.set(index, {
          productId: item.dressId,
          productName: item.name,
          productImage: item.image || '/placeholder.svg',
          rating: 5,
          reviewText: '',
          isReviewed: false
        });
      }
    });
    setReviews(reviewsMap);
    
    setIsLoading(false);
  }, []);

  const handleItemSelection = (index: number) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    // Only select items that can be reviewed (dress items with dressId)
    const reviewableIndices = cartItems
      .map((item, index) => (!item.isPhotographyService && item.dressId && reviews.has(index) ? index : -1))
      .filter(idx => idx !== -1);
    
    const selectedReviewableCount = Array.from(selectedItemIds).filter(idx => reviewableIndices.includes(idx)).length;
    
    if (selectedReviewableCount === reviewableIndices.length) {
      // Deselect all reviewable items
      setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        reviewableIndices.forEach(idx => newSet.delete(idx));
        return newSet;
      });
    } else {
      // Select all reviewable items
      setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        reviewableIndices.forEach(idx => newSet.add(idx));
        return newSet;
      });
    }
  };

  const handleRatingChange = (index: number, rating: number) => {
    setReviews(prev => {
      const newMap = new Map(prev);
      const review = newMap.get(index);
      if (review) {
        newMap.set(index, { ...review, rating });
      }
      return newMap;
    });
  };

  const handleReviewTextChange = (index: number, text: string) => {
    setReviews(prev => {
      const newMap = new Map(prev);
      const review = newMap.get(index);
      if (review) {
        newMap.set(index, { ...review, reviewText: text });
      }
      return newMap;
    });
  };

  const handleSubmitReviews = async () => {
    if (selectedItemIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm trong đơn hàng để đánh giá giao dịch');
      return;
    }

    if (!userId) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewPromises: Promise<void>[] = [];

      selectedItemIds.forEach(index => {
        const item = cartItems[index];
        const review = reviews.get(index);

        // Only review dress items
        if (!item.isPhotographyService && item.dressId && review && !review.isReviewed) {
          if (!review.reviewText.trim()) {
            toast.error(`Vui lòng nhập đánh giá giao dịch cho ${item.name}`);
            return;
          }

          const reviewData: ReviewSubmission = {
            dressId: item.dressId,
            rating: review.rating,
            reviewText: review.reviewText.trim(),
            userId: userId
          };

          reviewPromises.push(
            submitReview(reviewData)
              .then(() => {
                setReviews(prev => {
                  const newMap = new Map(prev);
                  const review = newMap.get(index);
                  if (review) {
                    newMap.set(index, { ...review, isReviewed: true });
                  }
                  return newMap;
                });
              })
              .catch(error => {
                console.error(`Error submitting review for ${item.name}:`, error);
                throw error;
              })
          );
        }
      });

      await Promise.all(reviewPromises);
      
      toast.success('Đánh giá giao dịch của bạn đã được gửi thành công!');
      
      // Navigate to order history after a short delay
      setTimeout(() => {
        navigate('/order-history');
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting reviews:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/order-history');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c3937c]"></div>
        </div>
      </div>
    );
  }

  // Filter only dress items that can be reviewed
  const reviewableItems = cartItems.filter((item, index) => 
    !item.isPhotographyService && item.dressId && reviews.has(index)
  );

  if (reviewableItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Không có giao dịch nào cần đánh giá</h1>
          <p className="text-gray-700 mb-6">
            Hiện tại không có sản phẩm nào trong đơn hàng để đánh giá giao dịch.
          </p>
          <button
            onClick={handleSkip}
            className="rounded-md bg-[#c3937c] px-6 py-3 text-white font-medium shadow-sm hover:bg-[#a67c66] focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
          >
            Xem lịch sử đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const reviewableIndices = cartItems
    .map((item, index) => (!item.isPhotographyService && item.dressId && reviews.has(index) ? index : -1))
    .filter(idx => idx !== -1);
  
  const selectedReviewableCount = Array.from(selectedItemIds).filter(idx => reviewableIndices.includes(idx)).length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-4">Đánh giá giao dịch</h1>
          <p className="text-lg text-gray-700">
            Chia sẻ trải nghiệm của bạn về giao dịch này
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Chọn sản phẩm trong đơn hàng để đánh giá ({selectedReviewableCount}/{reviewableItems.length} đã chọn)
            </h2>
            <button
              onClick={handleSelectAll}
              className="text-sm text-[#c3937c] hover:text-[#a67c66] font-medium"
            >
              {selectedReviewableCount === reviewableItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="space-y-6">
            {cartItems.map((item, index) => {
              // Only show dress items that can be reviewed
              if (item.isPhotographyService || !item.dressId || !reviews.has(index)) {
                return null;
              }

              const review = reviews.get(index);
              if (!review) return null;

              const isSelected = selectedItemIds.has(index);

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-6 ${
                    isSelected ? 'border-[#c3937c] bg-[#f8f3f0]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleItemSelection(index)}
                      className="mt-1 w-4 h-4 text-[#c3937c] border-gray-300 rounded focus:ring-[#c3937c]"
                    />
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{review.productName}</h3>
                      {item.sizeName && item.colorName && (
                        <p className="text-sm text-gray-500">{item.sizeName} · {item.colorName}</p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 space-y-4">
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đánh giá giao dịch
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(index, star)}
                              className="focus:outline-none"
                            >
                              <svg
                                className={`w-8 h-8 ${
                                  star <= review.rating
                                    ? 'text-[#f4b740] fill-[#f4b740]'
                                    : 'text-gray-300'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div>
                        <label htmlFor={`review-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Nhận xét về giao dịch
                        </label>
                        <textarea
                          id={`review-${index}`}
                          value={review.reviewText}
                          onChange={e => handleReviewTextChange(index, e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
                          placeholder="Chia sẻ trải nghiệm của bạn về giao dịch này (dịch vụ, giao hàng, chất lượng sản phẩm...)"
                        />
                      </div>

                      {review.isReviewed && (
                        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 text-sm">
                          ✓ Đã gửi đánh giá giao dịch thành công
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            onClick={handleSubmitReviews}
            disabled={isSubmitting || selectedItemIds.size === 0}
            className={`rounded-md px-6 py-3 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c3937c] ${
              isSubmitting || selectedItemIds.size === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#c3937c] hover:bg-[#a67c66]'
            }`}
          >
            {isSubmitting ? 'Đang gửi...' : `Gửi đánh giá giao dịch (${selectedItemIds.size} sản phẩm)`}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="text-[#c3937c] hover:text-[#a67c66] font-medium text-sm"
          >
            Bỏ qua và xem lịch sử đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReview;

