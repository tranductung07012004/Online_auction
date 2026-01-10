import { JSX, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { getReviewsByReceiverIdPublic, ReviewResponse, ReviewsPageResponse } from '../../api/review';
import { Pagination, Box, Card, CardContent, Typography, CircularProgress, Stack, Paper, Chip } from '@mui/material';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PublicUserReviewPage(): JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [reviewsReceived, setReviewsReceived] = useState<ReviewsPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        toast.error('Invalid user ID');
        navigate('/');
        return;
      }

      setLoading(true);
      
      try {
        const userIdNum = parseInt(userId, 10);
        if (isNaN(userIdNum)) {
          throw new Error('Invalid user ID format');
        }

        // Fetch reviews received
        const reviews = await getReviewsByReceiverIdPublic(userIdNum, page, size);
        setReviewsReceived(reviews);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        toast.error(err.message || 'Failed to load reviews');
        setReviewsReceived(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, page, size, navigate]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // MUI Pagination is 1-based, API is 0-based
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ReviewCard = ({ review }: { review: ReviewResponse }) => {
    // For public reviews, show sender info (person who reviewed this user)
    const userInfo = review.sender;
    
    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Header: User info and status */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    bgcolor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {userInfo.avatar ? (
                    <img
                      src={userInfo.avatar}
                      alt={userInfo.fullname}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  )}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                    {userInfo.fullname}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {userInfo.email}
                  </Typography>
                </Box>
              </Box>
              <Chip
                icon={review.status === 1 ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                label={review.status === 1 ? 'Liked' : 'Dislike'}
                sx={{
                  bgcolor: review.status === 1 ? '#a67c66' : '#8c6550',
                  color: '#fff',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: '#fff',
                  },
                }}
              />
            </Box>

            {/* Comment */}
            {review.comment && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f9f9f9',
                  borderRadius: 1,
                  borderLeft: '3px solid #a67c66',
                }}
              >
                <Typography variant="body1" sx={{ color: '#1a1a1a', whiteSpace: 'pre-wrap' }}>
                  {review.comment}
                </Typography>
              </Box>
            )}

            {/* Footer: Date */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatDate(review.createdAt)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <CircularProgress />
        </main>
        <Footer />
      </div>
    );
  }

  // Get user info from first review if available
  const userInfo = reviewsReceived?.content?.[0]?.receiver;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Box sx={{ mb: 3 }}>
            <Box
              onClick={() => navigate(-1)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                color: '#8c6550',
                '&:hover': {
                  color: '#a67c66',
                },
              }}
            >
              <ArrowLeft className="h-5 w-5" />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Back
              </Typography>
            </Box>
          </Box>

          {/* Reviews Card */}
          <Card sx={{ bgcolor: '#fff', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Star className="h-8 w-8" style={{ color: '#FFE082' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Reviews Received
                  </Typography>
                </Box>
                {userInfo && (
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Reviews that others have given to {userInfo.fullname}
                  </Typography>
                )}
              </Box>

              <Box sx={{ pt: 2 }}>
                {!reviewsReceived || reviewsReceived.content.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      bgcolor: '#f5f5f5',
                      borderRadius: 2,
                    }}
                  >
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      No reviews yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      This user hasn't received any reviews yet.
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    <Stack spacing={2}>
                      {reviewsReceived.content.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </Stack>

                    {/* Pagination */}
                    {reviewsReceived.totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                          count={reviewsReceived.totalPages}
                          page={page + 1}
                          onChange={handlePageChange}
                          size="large"
                          sx={{
                            '& .MuiPaginationItem-root': {
                              color: '#8c6550',
                              '&.Mui-selected': {
                                backgroundColor: '#EAD9C9',
                                color: '#8c6550',
                                '&:hover': {
                                  backgroundColor: '#d4c4b0',
                                },
                              },
                              '&:hover': {
                                backgroundColor: '#f5ede5',
                              },
                            },
                          }}
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
