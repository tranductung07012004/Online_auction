import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import { getUserProfile, sendSellerRequest, getSellerRequestStatus, type SellerRequest, type UserProfile } from '../../api/user';
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
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [requestStatus, setRequestStatus] = useState<SellerRequest | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profile, status] = await Promise.all([
          getUserProfile(),
          getSellerRequestStatus(),
        ]);
        setUserData(profile);
        setRequestStatus(status);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        toast.error(err.message || 'Failed to load data');
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

    try {
      setSubmitting(true);
      const newRequest = await sendSellerRequest(reason);
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
    switch (status) {
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
              userImage={userData?.profileImageUrl}
              fullName={
                userData
                  ? userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
                  : undefined
              }
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
                        bgcolor: requestStatus.status === 'approved' 
                          ? 'success.light' 
                          : requestStatus.status === 'rejected'
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
                  {(!requestStatus || requestStatus.status === 'rejected') && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {requestStatus?.status === 'rejected' 
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
                  {requestStatus?.status === 'approved' && (
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
                  {requestStatus?.status === 'pending' && (
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

