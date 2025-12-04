import React, { useState, useRef } from 'react';
import { Button } from '../../../components/button';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import { updateProfile, updatePassword, updateUsername, uploadProfileImage, UpdateProfileData } from '../../../api/user';
import { useAuth } from '../../../context/AuthContext';
import { AlertCircle, Camera, Upload } from 'lucide-react';

interface ProfileData {
  fullName: string;
  email: string;
  password: string;
  profileImageUrl?: string;
}

interface ProfileFormProps {
  initialData: ProfileData;
  onProfileUpdate?: (updatedData: UpdateProfileData) => void;
}

export default function ProfileForm({ initialData, onProfileUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { getRoleFromCookie } = useAuth();
  
  // For image upload
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For password change
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    confirmPassword: '',
  });
  
  // For email change
  const [showEmailChange, setShowEmailChange] = useState<boolean>(false);
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  // Trigger the file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size should be less than 2MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadProfileImage(formData);
      
      setFormData(prev => ({ 
        ...prev, 
        profileImageUrl: response.imageUrl 
      }));
      
      setSuccess('Profile image updated successfully');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types in the field
    if (name === 'confirmPassword') {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    
    // Validate confirm password matches new password
    if (name === 'confirmPassword' && passwordData.newPassword !== value) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (name === 'newPassword' && passwordData.confirmPassword) {
      // Also validate when new password is changed and confirm is already filled
      if (passwordData.confirmPassword !== value) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types in the field
    if (name === 'newEmail') {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedData: UpdateProfileData = {
        fullName: formData.fullName,
      };
      
      const response = await updateProfile(updatedData);
      setSuccess('Profile updated successfully');
      
      if (onProfileUpdate) {
        onProfileUpdate(updatedData);
      }
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await updatePassword(passwordData);
      setSuccess('Password updated successfully');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({ confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setEmailError(null);
    
    try {
      // Map emailData to the format expected by updateUsername API
      const response = await updateUsername({
        newUsername: emailData.newEmail,
        password: emailData.password,
      });
      
      // Refresh the token to update the email in the JWT
      await getRoleFromCookie();
      
      setSuccess('Email updated successfully');
      setShowEmailChange(false);
      
      // Update the form data with the new email
      setFormData(prev => ({ ...prev, email: response.email }));
      
      if (onProfileUpdate) {
        onProfileUpdate({ email: response.email });
      }
      
      setEmailData({
        newEmail: '',
        password: '',
      });
      
      // Refresh the page to ensure everything is updated
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      // Handle the error inside the modal
      setEmailError(err.message || 'Failed to update email');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Hello {formData.fullName || formData.email}!</h1>
        <p className="text-gray-500 mt-1">You can find all information about your profile</p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-rose-500 font-medium">Edit Your Profile</h2>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled={true}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowEmailChange(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-rose-500 font-medium mb-4">Your Password</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex space-x-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    disabled={true}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowPasswordChange(true)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          )}
        </form>
        
        {showPasswordChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-medium mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="text-red-600 text-sm flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {passwordErrors.confirmPassword}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordErrors({ confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                    disabled={isLoading || !!passwordErrors.confirmPassword}
                  >
                    {isLoading ? 'Saving...' : 'Save Password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {showEmailChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-medium mb-4">Change Email</h2>
              
              {emailError && (
                <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New Email</Label>
                  <Input
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    value={emailData.newEmail}
                    onChange={handleEmailChange}
                    required
                    className={emailError ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Confirm with Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={emailData.password}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowEmailChange(false);
                      setEmailError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Email'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
