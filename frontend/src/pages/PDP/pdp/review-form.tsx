import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';
import { submitReview, ReviewSubmission, checkUserReview } from '../../../api/dress';
import { useAuth } from '../../../context/AuthContext';

interface ReviewFormProps {
  dressId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ dressId, onReviewSubmitted }: ReviewFormProps): JSX.Element {
  const { isAuthenticated, checkAuthStatus, userId } = useAuth();
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sử dụng useEffect để kiểm tra xác thực từ đầu
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const isAuth = await checkAuthStatus();
        setIsAuthChecked(isAuth);
        
        // Check if user has already reviewed this product
        if (isAuth && userId) {
          try {
            const hasReviewed = await checkUserReview(dressId);
            setHasAlreadyReviewed(hasReviewed);
          } catch (error) {
            console.error("Error checking if user has already reviewed:", error);
          }
        }
      } else {
        setIsAuthChecked(false);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [isAuthenticated, checkAuthStatus, dressId, userId]);

  // Submit the review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to submit a review');
      return;
    }

    if (!isAuthChecked) {
      toast.error('Authentication required. Please sign in again.');
      return;
    }

    if (!userId) {
      toast.error('User ID is required. Please sign in again.');
      return;
    }

    // Xử lý dữ liệu form
    const trimmedReviewText = (reviewText || '').trim();
    if (!trimmedReviewText) {
      toast.error('Please enter a review');
      return;
    }

    try {
      setIsSubmitting(true);

      // Chuẩn bị dữ liệu
      const reviewData: ReviewSubmission = {
        dressId,
        rating: 5, // Default rating, can be removed from API later
        reviewText: trimmedReviewText,
        userId: userId
      };

      console.log('Submitting review from form:', {
        dressId,
        reviewText: trimmedReviewText.substring(0, 30) + (trimmedReviewText.length > 30 ? '...' : '')
      });
      
      // Gửi yêu cầu
      const result = await submitReview(reviewData);
      console.log('Review submission successful:', result);
      
      // Reset form
      setReviewText('');
      
      setHasAlreadyReviewed(true);
      toast.success('Your review has been submitted');
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Check if the error is about already having reviewed the product
      if (error.message && error.message.includes('already reviewed')) {
        setHasAlreadyReviewed(true);
        toast.error('You have already reviewed this product');
      } else {
        toast.error(error.message || 'Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#ead9c9] rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-500">Checking review status...</span>
        </div>
      </div>
    );
  }

  // If user has already submitted a review, show a message
  if (hasAlreadyReviewed) {
    return (
      <div className="space-y-4 border border-gray-200 rounded-md p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have already reviewed this product. Each customer can submit only one review per product.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 border border-gray-200 rounded-md p-4">
      <h3 className="text-lg font-medium">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Review Text */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="review-text" className="text-sm font-medium text-gray-700">
            Your question
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
            placeholder="Place your question to the seller here ..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-md flex items-center justify-center ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#ead9c9] text-[#333333] hover:bg-[#e0cbb9]'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit question'}
        </button>
      </form>
    </div>
  );
} 