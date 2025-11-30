import { useEffect, useState } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import ProfileForm from './profile/form';
import Footer from '../../components/footer';
import { getUserProfile } from '../../api/user';
import { UserProfile } from '../../api/user';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setUserData(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageUpdate = (imageUrl: string) => {
    if (userData) {
      setUserData({
        ...userData,
        profileImageUrl: imageUrl
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-rose-500 text-xl mb-4">Error loading profile</div>
            <p className="text-gray-600">{error || 'Something went wrong'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-rose-50 text-rose-500 rounded-md hover:bg-rose-100"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format userData to match the ProfileForm expected structure
  const profileData = {
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    phone: userData.phone || '',
    dateOfBirth: userData.dateOfBirth || '',
    username: userData.username || '',
    password: '********',  // For display purposes only
    profileImageUrl: userData.profileImageUrl || '',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="profile"
              userName={userData.username}
              userImage={userData.profileImageUrl}
              onImageUpdate={handleImageUpdate}
              fullName={`${userData.firstName} ${userData.lastName}`}
            />
          </div>

          <div className="md:col-span-2 bg-white rounded-lg border p-6">
            <ProfileForm 
              initialData={profileData} 
              onProfileUpdate={(updatedData) => {
                if (userData) {
                  setUserData({
                    ...userData,
                    ...updatedData
                  });
                }
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
