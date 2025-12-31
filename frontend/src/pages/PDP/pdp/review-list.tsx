import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import { createAnswer } from '../../../api/product';
import { User } from 'lucide-react';
import { Box, Pagination } from '@mui/material';

interface ReviewListProps {
  questions: any[]; // Using any to support Q&A structure with questionText and answers array
  onRefresh: () => void;
  canAnswerQuestion: boolean; // Only product seller can answer
}

interface AnswerFormState {
  questionId: string | null;
  answerText: string;
  isSubmitting: boolean;
}

export default function ReviewList({ questions, onRefresh, canAnswerQuestion }: ReviewListProps): JSX.Element {
  const { isAuthenticated } = useAuthStore();
  const [answerForm, setAnswerForm] = useState<AnswerFormState>({
    questionId: null,
    answerText: '',
    isSubmitting: false,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Pagination settings
  const itemsPerPage = 3;
  const totalPages = Math.ceil(questions.length / itemsPerPage);

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
      console.log("haha")

      await createAnswer(questionId, answerForm.answerText);
      
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
      
      // Handle error response format: { message: "...", data: { errorCode: "..." } }
      let errorMessage = 'Failed to submit answer';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        errorMessage = responseData.message || errorMessage;
        
        // Check if it's the max answers reached error
        if (responseData.data?.errorCode === 'INVALID_OPERATION') {
          errorMessage = 'This question has already reached the maximum of 2 answers';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      setAnswerForm(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  // Get questions to display based on current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = questions.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // Scroll to top of Q&A section
    window.scrollTo({ top: document.getElementById('qa-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  if (questions.length === 0) {
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
                {question.icon && question.icon !== '/placeholder-user.jpg' ? (
                  <img 
                    src={question.icon} 
                    alt={question.username} 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      // Replace with user icon if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
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

              {/* Answer button (only show if answers count < 2 and user can answer) */}
              {canAnswerQuestion && (!question.answers || question.answers.length < 2) && (
                <button
                  onClick={() => toggleAnswerForm(question._id)}
                  className="text-xs text-[#c3937c] hover:underline ml-6"
                >
                  {answerForm.questionId === question._id ? 'Cancel' : 'Answer this question'}
                </button>
              )}

              {/* Answer form */}
              {canAnswerQuestion && answerForm.questionId === question._id && (!question.answers || question.answers.length < 2) && (
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

              {/* Answers if exist - display all answers */}
              {question.answers && question.answers.length > 0 && (
                <div className="mt-4 space-y-3">
                  {question.answers.map((answer: any, answerIndex: number) => (
                    <div key={answer.id || answerIndex} className="pl-6 border-l-2 border-[#c3937c]">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-[#f2f2f2] overflow-hidden flex items-center justify-center">
                            {answer.icon && answer.icon !== '/placeholder-user.jpg' ? (
                              <img 
                                src={answer.icon} 
                                alt={answer.username} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  // Replace with user icon if image fails to load
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                }}
                              />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-medium text-[#333333]">{answer.username}</h5>
                            <span className="text-xs text-[#868686]">
                              {new Date(answer.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-start space-x-2 mt-1">
                            <span className="text-[#2e7d32] font-bold text-sm">A:</span>
                            <p className="text-xs text-[#333333] flex-1">{answer.answerText}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {questions.length > itemsPerPage && (
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