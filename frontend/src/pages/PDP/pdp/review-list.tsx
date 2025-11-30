import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { DressReview } from '../../../api/dress';
import { useAuth } from '../../../context/AuthContext';
import { replyToReview } from '../../../api/dress';
import { User } from 'lucide-react';
import axios from 'axios';

// Backend URL for serving static files
const BACKEND_URL = 'http://localhost:3000';

// Map to cache user avatars to avoid redundant API calls
const userAvatarCache = new Map();

interface ReviewListProps {
  dressId: string;
  reviews: any[]; // Sử dụng any thay vì DressReview vì cần mở rộng để hỗ trợ replies
  onRefresh: () => void;
}

interface ReplyFormState {
  reviewId: string | null;
  replyText: string;
  isSubmitting: boolean;
}

// Function to ensure image URLs are properly formatted
const getFullImageUrl = (imageUrl: string) => {
  if (!imageUrl) return null;
  
  // If already an absolute URL, return as is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
    return imageUrl;
  }
  
  // If image path doesn't start with /uploads, add it
  const path = imageUrl.startsWith('/uploads') ? imageUrl : `/uploads${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  
  // Return the full URL
  return `${BACKEND_URL}${path}`;
};

// Function to get user avatar by username
const getUserAvatar = async (username: string): Promise<string | null> => {
  // Return from cache if available
  if (userAvatarCache.has(username)) {
    return userAvatarCache.get(username);
  }
  
  try {
    // Try to fetch the user profile to get the avatar
    const response = await axios.get(`${BACKEND_URL}/users/profile/${username}`, {
      withCredentials: true
    });
    
    if (response.data?.success && response.data?.data) {
      // Try both property names since different API endpoints might use different names
      const avatarUrl = response.data.data.profileImage || response.data.data.profileImageUrl || null;
      if (avatarUrl) {
        userAvatarCache.set(username, avatarUrl);
        return avatarUrl;
      }
    }
    
    // If no avatar found, cache null to avoid repeated requests
    userAvatarCache.set(username, null);
    return null;
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    return null;
  }
};

export default function ReviewList({ dressId, reviews, onRefresh }: ReviewListProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  const [replyForm, setReplyForm] = useState<ReplyFormState>({
    reviewId: null,
    replyText: '',
    isSubmitting: false,
  });
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [userAvatars, setUserAvatars] = useState<{[username: string]: string | null}>({});

  // Fetch avatars for all users in the reviews
  useEffect(() => {
    const fetchAvatars = async () => {
      const avatarPromises = reviews.map(async (review) => {
        // Skip if we already have this user's avatar
        if (userAvatars[review.username]) return;
        
        // Try to get avatar from the user's profile or from review.icon
        const avatarUrl = review.icon ? getFullImageUrl(review.icon) : await getUserAvatar(review.username);
        
        // Update the avatar in state
        if (avatarUrl) {
          setUserAvatars(prev => ({
            ...prev,
            [review.username]: avatarUrl
          }));
        }
      });

      // Also fetch for reply authors
      reviews.forEach(review => {
        if (review.replies && review.replies.length > 0) {
          review.replies.forEach(async (reply: any) => {
            if (userAvatars[reply.username]) return;
            
            const avatarUrl = reply.icon ? getFullImageUrl(reply.icon) : await getUserAvatar(reply.username);
            
            if (avatarUrl) {
              setUserAvatars(prev => ({
                ...prev,
                [reply.username]: avatarUrl
              }));
            }
          });
        }
      });

      // Wait for all avatar fetches to complete
      await Promise.all(avatarPromises);
    };

    fetchAvatars();
  }, [reviews]);

  // Toggle reply form
  const toggleReplyForm = (reviewId: string | null) => {
    setReplyForm(prev => ({
      ...prev,
      reviewId: prev.reviewId === reviewId ? null : reviewId,
      replyText: '',
    }));
  };

  // Handle reply text change
  const handleReplyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyForm(prev => ({
      ...prev,
      replyText: e.target.value,
    }));
  };

  // Submit reply
  const handleSubmitReply = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to reply to reviews');
      return;
    }

    if (replyForm.replyText.trim() === '') {
      toast.error('Please enter a reply');
      return;
    }

    try {
      setReplyForm(prev => ({
        ...prev,
        isSubmitting: true,
      }));

      await replyToReview(dressId, reviewId, replyForm.replyText);
      
      // Reset form
      setReplyForm({
        reviewId: null,
        replyText: '',
        isSubmitting: false,
      });
      
      toast.success('Your reply has been submitted');
      onRefresh();
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      toast.error(error.message || 'Failed to submit reply');
      
      setReplyForm(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  // Get reviews to display based on showAllReviews state
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (reviews.length === 0) {
    return (
      <div className="text-gray-500 italic text-center py-4">
        No reviews yet. Be the first to leave a review!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {displayedReviews.map((review, index) => (
        <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#f2f2f2] overflow-hidden flex items-center justify-center">
                {userAvatars[review.username] || review.icon ? (
                  <img 
                    src={userAvatars[review.username] || getFullImageUrl(review.icon)} 
                    alt={review.username} 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      // Replace with user icon if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                      e.currentTarget.parentElement!.appendChild(icon);
                    }}
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-[#333333]">{review.username}</h4>
                <span className="text-xs text-[#868686]">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>

              {/* Rating */}
              <div className="flex mb-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className={`w-3 h-3 ${star <= review.rating ? 'text-[#f4b740] fill-[#f4b740]' : 'text-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Review text */}
              <p className="text-sm text-[#333333]">{review.reviewText}</p>

              {/* Review images if any */}
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {review.images.map((image: string, imgIndex: number) => (
                    <div key={imgIndex} className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                      <img 
                        src={getFullImageUrl(image)} 
                        alt={`Review image ${imgIndex + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Show placeholder if image fails to load
                          (e.target as HTMLImageElement).src = '/placeholder.svg?height=64&width=64';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Reply button */}
              <button
                onClick={() => toggleReplyForm(review._id)}
                className="text-xs text-[#c3937c] hover:underline"
              >
                {replyForm.reviewId === review._id ? 'Cancel Reply' : 'Reply'}
              </button>

              {/* Reply form */}
              {replyForm.reviewId === review._id && (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={replyForm.replyText}
                    onChange={handleReplyTextChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                    placeholder="Write your reply..."
                    rows={3}
                  />
                  <button
                    onClick={() => handleSubmitReply(review._id)}
                    disabled={replyForm.isSubmitting}
                    className={`px-4 py-1 rounded-md text-sm ${
                      replyForm.isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#ead9c9] text-[#333333] hover:bg-[#e0cbb9]'
                    }`}
                  >
                    {replyForm.isSubmitting ? 'Sending...' : 'Submit Reply'}
                  </button>
                </div>
              )}

              {/* Replies if any */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                  {review.replies.map((reply: any, replyIndex: number) => (
                    <div key={replyIndex} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#f2f2f2] overflow-hidden flex items-center justify-center">
                          {userAvatars[reply.username] || reply.icon ? (
                            <img 
                              src={userAvatars[reply.username] || getFullImageUrl(reply.icon)} 
                              alt={reply.username} 
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                // Replace with user icon if image fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                                e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                e.currentTarget.parentElement!.appendChild(icon);
                              }}
                            />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-medium text-[#333333]">{reply.username}</h5>
                          <span className="text-xs text-[#868686]">
                            {new Date(reply.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#333333] mt-1">{reply.replyText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* View all / View less button */}
      {reviews.length > 3 && (
        <button
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="text-sm text-[#c3937c] hover:underline"
        >
          {showAllReviews 
            ? 'View less reviews' 
            : `View all ${reviews.length} reviews`}
        </button>
      )}
    </div>
  );
} 