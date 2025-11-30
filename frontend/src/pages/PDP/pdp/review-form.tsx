import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Star, Upload, X, AlertCircle } from 'lucide-react';
import { submitReview, ReviewSubmission, checkUserReview } from '../../../api/dress';
import { useAuth } from '../../../context/AuthContext';

interface ReviewFormProps {
  dressId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ dressId, onReviewSubmitted }: ReviewFormProps): JSX.Element {
  const { isAuthenticated, checkAuthStatus, userId } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showRatingError, setShowRatingError] = useState<boolean>(false);

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

  // Reset rating error when user selects a rating
  useEffect(() => {
    if (rating !== null) {
      setShowRatingError(false);
    }
  }, [rating]);

  // Handle star rating selection
  const handleSetRating = (value: number) => {
    setRating(value);
    setShowRatingError(false);
  };

  // Handle star hover
  const handleHoverRating = (value: number) => {
    setHoverRating(value);
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      console.log('Selected files:', selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
      
      if (images.length + selectedFiles.length > 3) {
        toast.error('You can upload up to 3 images');
        return;
      }

      // Create object URLs for preview
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      console.log('Created URL previews for', newPreviewUrls.length, 'images');
      
      setImages(prevImages => [...prevImages, ...selectedFiles]);
      setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };

  // Remove an image from the selection
  const removeImage = (index: number) => {
    // Release the object URL
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

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
    if (rating === null || rating < 1 || rating > 5) {
      setShowRatingError(true);
      toast.error('Please select a valid rating (1-5 stars)');
      return;
    }

    const trimmedReviewText = (reviewText || '').trim();
    if (!trimmedReviewText) {
      toast.error('Please enter a review');
      return;
    }

    try {
      setIsSubmitting(true);

      // Chuẩn bị dữ liệu
      const validRating = Math.max(1, Math.min(5, rating));
      
      const reviewData: ReviewSubmission = {
        dressId,
        rating: validRating,
        reviewText: trimmedReviewText,
        images: images.length > 0 ? images : undefined,
        userId: userId
      };

      console.log('Submitting review from form:', {
        dressId,
        rating: validRating,
        reviewText: trimmedReviewText.substring(0, 30) + (trimmedReviewText.length > 30 ? '...' : ''),
        imageCount: images.length,
        imageTypes: images.map(img => img.type),
        imageSizes: images.map(img => Math.round(img.size / 1024) + 'KB')
      });
      
      // Gửi yêu cầu
      const result = await submitReview(reviewData);
      console.log('Review submission successful:', result);
      
      // Reset form
      setRating(null);
      setReviewText('');
      setImages([]);
      setImagePreviewUrls(prevUrls => {
        // Release all object URLs
        prevUrls.forEach(url => {
          try {
            URL.revokeObjectURL(url);
          } catch (err) {
            console.error('Error revoking URL:', err);
          }
        });
        return [];
      });
      
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
        {/* Star Rating */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => handleSetRating(star)}
                onMouseEnter={() => handleHoverRating(star)}
                onMouseLeave={() => handleHoverRating(0)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-6 h-6 ${
                    (hoverRating !== 0 ? star <= hoverRating : (rating !== null && star <= rating))
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
          {showRatingError && (
            <div className="text-sm text-red-500 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Vui lòng đánh giá từ 1 đến 5 sao trước khi gửi
            </div>
          )}
        </div>

        {/* Review Text */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="review-text" className="text-sm font-medium text-gray-700">
            Your Review
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#c3937c]"
            placeholder="Write your review here..."
          />
        </div>

        {/* Image Upload */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Upload Photos (up to 3)</label>
          
          {/* Image previews */}
          {imagePreviewUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative group w-16 h-16 rounded-md overflow-hidden border border-gray-300">
                  <img src={url} alt={`Upload preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload button */}
          {imagePreviewUrls.length < 3 && (
            <div className="flex justify-center items-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="photo-upload"
                disabled={isSubmitting}
              />
              <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Click to upload photos</span>
              </label>
            </div>
          )}
          
          <p className="text-xs text-gray-500">
            Upload photos (max 3) in JPG, PNG format. Maximum file size: 5MB.
          </p>
        </div>

        <div className="text-xs text-gray-500 italic">
          Note: You can only submit one review per product.
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
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
} 