import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { replyToReview } from '../../../api/dress';
import { User } from 'lucide-react';
import axios from 'axios';
import { Box, Pagination } from '@mui/material';

// Backend URL for serving static files
const BACKEND_URL = 'http://localhost:3000';

// Map to cache user avatars to avoid redundant API calls
const userAvatarCache = new Map();

interface ReviewListProps {
  dressId: string;
  reviews: any[]; // Using any to support Q&A structure with questionText and answer
  onRefresh: () => void;
}

interface AnswerFormState {
  questionId: string | null;
  answerText: string;
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
  const [answerForm, setAnswerForm] = useState<AnswerFormState>({
    questionId: null,
    answerText: '',
    isSubmitting: false,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userAvatars, setUserAvatars] = useState<{[username: string]: string | null}>({});
  
  // Pagination settings
  const itemsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  // Fetch avatars for all users in the questions
  useEffect(() => {
    const fetchAvatars = async () => {
      const avatarPromises = reviews.map(async (question) => {
        // Skip if we already have this user's avatar
        if (userAvatars[question.username]) return;
        
        // Try to get avatar from the user's profile or from question.icon
        const avatarUrl = question.icon ? getFullImageUrl(question.icon) : await getUserAvatar(question.username);
        
        // Update the avatar in state
        if (avatarUrl) {
          setUserAvatars(prev => ({
            ...prev,
            [question.username]: avatarUrl
          }));
        }
      });

      // Also fetch for answer authors
      reviews.forEach(question => {
        if (question.answer) {
          (async () => {
            if (userAvatars[question.answer.username]) return;
            
            const avatarUrl = question.answer.icon ? getFullImageUrl(question.answer.icon) : await getUserAvatar(question.answer.username);
            
            if (avatarUrl) {
              setUserAvatars(prev => ({
                ...prev,
                [question.answer.username]: avatarUrl
              }));
            }
          })();
        }
      });

      // Wait for all avatar fetches to complete
      await Promise.all(avatarPromises);
    };

    fetchAvatars();
    
    // Reset to page 1 when reviews change (new question/answer added)
    setCurrentPage(1);
  }, [reviews]);

  // Toggle answer form
  const toggleAnswerForm = (questionId: string | null) => {
    setAnswerForm(prev => ({
      ...prev,
      questionId: prev.questionId === questionId ? null : questionId,
      answerText: '',
    }));
  };

  // Handle answer text change
  const handleAnswerTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswerForm(prev => ({
      ...prev,
      answerText: e.target.value,
    }));
  };

  // Submit answer
  const handleSubmitAnswer = async (questionId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to answer questions');
      return;
    }

    if (answerForm.answerText.trim() === '') {
      toast.error('Please enter an answer');
      return;
    }

    try {
      setAnswerForm(prev => ({
        ...prev,
        isSubmitting: true,
      }));

      await replyToReview(dressId, questionId, answerForm.answerText);
      
      // Reset form
      setAnswerForm({
        questionId: null,
        answerText: '',
        isSubmitting: false,
      });
      
      toast.success('Your answer has been submitted');
      onRefresh();
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast.error(error.message || 'Failed to submit answer');
      
      setAnswerForm(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  // Get questions to display based on current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = reviews.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // Scroll to top of Q&A section
    window.scrollTo({ top: document.getElementById('qa-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-gray-500 italic text-center py-4">
        No questions yet. Be the first to ask a question!
      </div>
    );
  }

  return (
    <div className="space-y-6" id="qa-section">
      {currentQuestions.map((question, index) => (
        <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#f2f2f2] overflow-hidden flex items-center justify-center">
                {userAvatars[question.username] || question.icon ? (
                  <img 
                    src={(userAvatars[question.username] || getFullImageUrl(question.icon)) || '/placeholder-user.jpg'} 
                    alt={question.username} 
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
                <h4 className="text-sm font-medium text-[#333333]">{question.username}</h4>
                <span className="text-xs text-[#868686]">
                  {new Date(question.date).toLocaleDateString()}
                </span>
              </div>

              {/* Question icon */}
              <div className="flex items-start space-x-2">
                <span className="text-[#c3937c] font-bold text-lg">Q:</span>
                <p className="text-sm text-[#333333] flex-1">{question.questionText}</p>
              </div>

              {/* Question images if any */}
              {question.images && question.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 ml-6">
                  {question.images.map((image: string, imgIndex: number) => (
                    <div key={imgIndex} className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                      <img 
                        src={getFullImageUrl(image) || '/placeholder.svg'} 
                        alt={`Question image ${imgIndex + 1}`} 
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

              {/* Answer button (only show if no answer exists) */}
              {!question.answer && (
                <button
                  onClick={() => toggleAnswerForm(question._id)}
                  className="text-xs text-[#c3937c] hover:underline ml-6"
                >
                  {answerForm.questionId === question._id ? 'Cancel' : 'Answer this question'}
                </button>
              )}

              {/* Answer form */}
              {answerForm.questionId === question._id && !question.answer && (
                <div className="mt-3 space-y-3 ml-6">
                  <textarea
                    value={answerForm.answerText}
                    onChange={handleAnswerTextChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                    placeholder="Write your answer..."
                    rows={3}
                  />
                  <button
                    onClick={() => handleSubmitAnswer(question._id)}
                    disabled={answerForm.isSubmitting}
                    className={`px-4 py-1 rounded-md text-sm ${
                      answerForm.isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#ead9c9] text-[#333333] hover:bg-[#e0cbb9]'
                    }`}
                  >
                    {answerForm.isSubmitting ? 'Sending...' : 'Submit Answer'}
                  </button>
                </div>
              )}

              {/* Answer if exists */}
              {question.answer && (
                <div className="mt-4 pl-6 border-l-2 border-[#c3937c]">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#f2f2f2] overflow-hidden flex items-center justify-center">
                        {userAvatars[question.answer.username] || question.answer.icon ? (
                          <img 
                            src={(userAvatars[question.answer.username] || getFullImageUrl(question.answer.icon)) || '/placeholder-user.jpg'} 
                            alt={question.answer.username} 
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
                        <h5 className="text-xs font-medium text-[#333333]">{question.answer.username}</h5>
                        <span className="text-xs text-[#868686]">
                          {new Date(question.answer.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-start space-x-2 mt-1">
                        <span className="text-[#2e7d32] font-bold text-sm">A:</span>
                        <p className="text-xs text-[#333333] flex-1">{question.answer.answerText}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {reviews.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pt: 4, borderTop: '1px solid #e5e7eb' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#333333',
                '&.Mui-selected': {
                  backgroundColor: '#EAD9C9',
                  color: '#333333',
                  '&:hover': {
                    backgroundColor: '#e0cbb9',
                  },
                },
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              },
            }}
          />
        </Box>
      )}
    </div>
  );
} 