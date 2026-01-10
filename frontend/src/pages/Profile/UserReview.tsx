import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import { getUserProfile, UserProfileResponse } from '../../api/profileApi';
import { getReviewsBySenderId, getReviewsByReceiverId, ReviewResponse, ReviewsPageResponse } from '../../api/review';
import { Pagination, Box, Card, CardContent, Typography, CircularProgress, Stack, Paper, Chip, Tabs, Tab } from '@mui/material';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`review-tabpanel-${index}`}
      aria-labelledby={`review-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserReviewPage(): JSX.Element {
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [reviewsSent, setReviewsSent] = useState<ReviewsPageResponse | null>(null);
  const [reviewsReceived, setReviewsReceived] = useState<ReviewsPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserData(profile);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        toast.error(err.message || 'Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      
      try {
        if (activeTab === 0) {
          // Fetch reviews sent
          const reviews = await getReviewsBySenderId(page, size);
          setReviewsSent(reviews);
        } else {
          // Fetch reviews received
          const reviews = await getReviewsByReceiverId(page, size);
          setReviewsReceived(reviews);
        }
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        toast.error(err.message || 'Failed to load reviews');
        if (activeTab === 0) {
          setReviewsSent(null);
        } else {
          setReviewsReceived(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [page, size, activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when switching tabs
  };

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

  const ReviewCard = ({ review, isReceived = false }: { review: ReviewResponse; isReceived?: boolean }) => {
    // For received reviews, show sender info (person who reviewed you)
    // For sent reviews, show receiver info (person you reviewed)
    const userInfo = isReceived ? review.sender : review.receiver;
    
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="user-review"
              userName={userData?.email || 'User'}
              userImage={userData?.avatar}
              fullName={userData?.fullname}
              assessment={userData?.assessment}
            />
          </div>

          <div className="md:col-span-2">
            <Card sx={{ bgcolor: '#fff', borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Star className="h-8 w-8" style={{ color: '#FFE082' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      My Reviews
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    View and manage reviews you have sent and received
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card sx={{ bgcolor: '#fff', borderRadius: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: '#666',
                      '&.Mui-selected': {
                        color: '#a67c66',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#a67c66',
                    },
                  }}
                >
                  <Tab label="Reviews Sent" />
                  <Tab label="Reviews Received" />
                </Tabs>
              </Box>

              {/* Tab Panel: Review Sent */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 3 }}>
                  {!reviewsSent || reviewsSent.content.length === 0 ? (
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
                        You haven't sent any reviews yet
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Reviews you send will appear here
                      </Typography>
                    </Paper>
                  ) : (
                    <>
                      <Stack spacing={2}>
                        {reviewsSent.content.map((review) => (
                          <ReviewCard key={review.id} review={review} isReceived={false} />
                        ))}
                      </Stack>

                      {/* Pagination */}
                      {reviewsSent.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                          <Pagination
                            count={reviewsSent.totalPages}
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
              </TabPanel>

              {/* Tab Panel: Review Received */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ p: 3 }}>
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
                        You haven't received any reviews yet
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Reviews you receive will appear here
                      </Typography>
                    </Paper>
                  ) : (
                    <>
                      <Stack spacing={2}>
                        {reviewsReceived.content.map((review) => (
                          <ReviewCard key={review.id} review={review} isReceived={true} />
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
              </TabPanel>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

