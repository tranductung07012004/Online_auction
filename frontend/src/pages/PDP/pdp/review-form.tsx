import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createQuestion } from '../../../api/product';
import { useAuthStore } from '../../../stores/authStore';

interface ReviewFormProps {
  dressId: string;
  onReviewSubmitted: () => void;
  canSubmitQuestion: boolean; // Only BIDDER or SELLER can submit
}

export default function ReviewForm({ dressId, onReviewSubmitted, canSubmitQuestion }: ReviewFormProps): JSX.Element {
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const [questionText, setQuestionText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sử dụng useEffect để kiểm tra xác thực từ đầu
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const isAuth = await checkAuthStatus();
        setIsAuthChecked(isAuth);
      } else {
        setIsAuthChecked(false);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [isAuthenticated, checkAuthStatus]);

  // Submit the question
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to submit a question');
      return;
    }

    if (!isAuthChecked) {
      toast.error('Authentication required. Please sign in again.');
      return;
    }

    if (!dressId) {
      toast.error('Product ID is required.');
      return;
    }

    // Xử lý dữ liệu form
    const trimmedQuestionText = (questionText || '').trim();
    if (!trimmedQuestionText) {
      toast.error('Please enter a question');
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('Submitting question from form:', {
        productId: dressId,
        content: trimmedQuestionText.substring(0, 30) + (trimmedQuestionText.length > 30 ? '...' : '')
      });
      
      // Gửi yêu cầu
      const result = await createQuestion(dressId, trimmedQuestionText);
      console.log('Question submission successful:', result);
      
      // Reset form
      setQuestionText('');
      
      toast.success('Your question has been submitted');
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting question:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to submit question');
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
          <span className="ml-2 text-gray-500">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Hide form if user cannot submit questions
  if (!canSubmitQuestion) {
    return <></>;
  }

  return (
    <div className="space-y-4 border border-gray-200 rounded-md p-4">
      <h3 className="text-lg font-medium">Write a question here</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Text */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="question-text" className="text-sm font-medium text-gray-700">
            Your question
          </label>
          <textarea
            id="question-text"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
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