import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import { getUserProfile, UserProfileResponse } from '../../api/profileApi';
import { createSellerRequest, getMySellerRequest, type SellerRequestResponse } from '../../api/sellerRequest';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SellerRequestPage(): JSX.Element {
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [requestStatus, setRequestStatus] = useState<SellerRequestResponse | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch user profile
      try {
        const profile = await getUserProfile();
        setUserData(profile);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        toast.error(err.message || 'Failed to load user profile');
      }
      
      // Fetch seller request status
      try {
        const status = await getMySellerRequest();
        setRequestStatus(status);
      } catch (err: any) {
        // Don't show error toast for seller request if it's just not found (404)
        const errorMessage = err.response.data.message;
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do');
      return;
    }

    // Validate reason length (10-1000 characters as per backend)
    if (reason.trim().length < 10) {
      toast.error('Lý do phải có ít nhất 10 ký tự');
      return;
    }

    if (reason.trim().length > 1000) {
      toast.error('Lý do không được vượt quá 1000 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      const newRequest = await createSellerRequest({ reason: reason.trim() });
      setRequestStatus(newRequest);
      setReason('');
      toast.success('Gửi yêu cầu thành công! Admin sẽ xem xét yêu cầu của bạn.');
    } catch (err: any) {
      console.error('Error submitting request:', err);
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status?: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'approved':
        return (
          <Chip
            icon={<CheckCircle className="h-4 w-4" />}
            label="Đã duyệt"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<XCircle className="h-4 w-4" />}
            label="Đã từ chối"
            color="error"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'pending':
      default:
        return (
          <Chip
            icon={<Clock className="h-4 w-4" />}
            label="Đang chờ"
            color="warning"
            sx={{ fontWeight: 600 }}
          />
        );
    }
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
              activeTab="become-seller"
              userName={userData?.email || 'User'}
              userImage={userData?.avatar}
              fullName={userData?.fullname}
              assessment={userData?.assessment}
            />
          </div>

          <div className="md:col-span-2">
            <Card sx={{ bgcolor: '#fff', borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Store className="h-8 w-8" style={{ color: '#FFE082' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      Trở thành Seller
                    </Typography>
                  </Box>

                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Bạn muốn bán sản phẩm trên nền tảng của chúng tôi? Gửi yêu cầu để admin xem xét và phê duyệt tài khoản seller của bạn.
                  </Typography>

                  {/* Current Request Status */}
                  {requestStatus && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor: requestStatus.status?.toLowerCase() === 'approved' 
                          ? 'success.light' 
                          : requestStatus.status?.toLowerCase() === 'rejected'
                          ? 'error.light'
                          : 'warning.light',
                        borderRadius: 2,
                      }}
                    >
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Trạng thái yêu cầu
                          </Typography>
                          {getStatusChip(requestStatus.status)}
                        </Box>
                        {requestStatus.reason && (
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                              Lý do:
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {requestStatus.reason}
                            </Typography>
                          </Box>
                        )}
                        {requestStatus.createdAt && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Gửi lúc: {new Date(requestStatus.createdAt).toLocaleString('vi-VN')}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  )}

                  {/* Request Form */}
                  {(!requestStatus || requestStatus.status?.toLowerCase() === 'rejected') && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {requestStatus?.status?.toLowerCase() === 'rejected' 
                          ? 'Gửi lại yêu cầu' 
                          : 'Gửi yêu cầu trở thành Seller'}
                      </Typography>
                      <Stack spacing={2}>
                        <TextField
                          label="Lý do bạn muốn trở thành Seller"
                          multiline
                          rows={6}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Ví dụ: Tôi có nhiều kinh nghiệm trong việc bán áo dài và muốn mở rộng kinh doanh trên nền tảng này..."
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#fff',
                              '&:hover fieldset': {
                                borderColor: '#FFE082',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#FFE082',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#FFE082',
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          size="large"
                          onClick={handleSubmit}
                          disabled={submitting || !reason.trim()}
                          startIcon={submitting ? <CircularProgress size={20} /> : <Send className="h-5 w-5" />}
                          sx={{
                            bgcolor: '#E91E63',
                            '&:hover': {
                              bgcolor: '#C2185B',
                            },
                            fontWeight: 600,
                            py: 1.5,
                          }}
                        >
                          {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* Approved Message */}
                  {requestStatus?.status?.toLowerCase() === 'approved' && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Chúc mừng! Yêu cầu của bạn đã được duyệt.
                      </Typography>
                      <Typography variant="body2">
                        Bạn có thể bắt đầu đăng sản phẩm và bán hàng trên nền tảng của chúng tôi.
                      </Typography>
                    </Alert>
                  )}

                  {/* Pending Message */}
                  {requestStatus?.status?.toLowerCase() === 'pending' && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        Yêu cầu của bạn đang được xem xét
                      </Typography>
                      <Typography variant="body2">
                        Admin sẽ xem xét yêu cầu của bạn trong thời gian sớm nhất. Vui lòng chờ thông báo.
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

