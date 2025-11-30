import React, { useState, useRef } from 'react';
import { Button } from '../../../components/button';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import { updateProfile, updatePassword, updateUsername, uploadProfileImage, UpdateProfileData } from '../../../api/user';
import { useAuth } from '../../../context/AuthContext';
import { AlertCircle, Camera, Upload } from 'lucide-react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  username: string;
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
  
  // Form validation errors
  const [dobError, setDobError] = useState<string | null>(null);
  
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
  
  // For username change
  const [showUsernameChange, setShowUsernameChange] = useState<boolean>(false);
  const [usernameData, setUsernameData] = useState({
    newUsername: '',
    password: '',
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);

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

  // Format date from yyyy-mm-dd to dd/mm/yyyy for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    
    // Check if date is already in dd/mm/yyyy format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Format date from dd/mm/yyyy to yyyy-mm-dd for input
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    // Check if already in yyyy-mm-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    try {
      // Parse dd/mm/yyyy
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
        const year = parseInt(parts[2], 10);
        
        const date = new Date(year, month, day);
        if (isNaN(date.getTime())) return '';
        
        return date.toISOString().split('T')[0]; // Returns yyyy-mm-dd
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  // Validate date of birth (must be 16+ years old)
  const validateDateOfBirth = (dateString: string): boolean => {
    try {
      let date;
      
      // Handle different date formats
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // Format: yyyy-mm-dd
        date = new Date(dateString);
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        // Format: dd/mm/yyyy
        const parts = dateString.split('/');
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        return false;
      }
      
      if (isNaN(date.getTime())) return false;
      
      // Calculate age
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      
      return age >= 16;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      // Clear previous error
      setDobError(null);
      
      // If using HTML date input, the value will be in yyyy-mm-dd format
      const formattedDate = value; // We'll convert when saving
      
      // Validate age if a date is entered
      if (value && !validateDateOfBirth(value)) {
        setDobError('You must be at least 16 years old');
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedDate }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUsernameData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types in the field
    if (name === 'newUsername') {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validate date of birth
    if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
      setDobError('You must be at least 16 years old');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Format date to dd/mm/yyyy for API
      let formattedDob = formData.dateOfBirth;
      if (formData.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
        const date = new Date(formData.dateOfBirth);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        formattedDob = `${day}/${month}/${year}`;
      }
      
      const updatedData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formattedDob,
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

  const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setUsernameError(null);
    
    try {
      const response = await updateUsername(usernameData);
      
      // Refresh the token to update the username in the JWT
      await getRoleFromCookie();
      
      setSuccess('Username updated successfully');
      setShowUsernameChange(false);
      
      // Update the form data with the new username
      setFormData(prev => ({ ...prev, username: response.username }));
      
      if (onProfileUpdate) {
        onProfileUpdate({ username: response.username });
      }
      
      setUsernameData({
        newUsername: '',
        password: '',
      });
      
      // Refresh the page to ensure everything is updated
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      // Handle the error inside the modal
      setUsernameError(err.message || 'Failed to update username');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Hello {formData.firstName || formData.username}!</h1>
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
            {/* First name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            {/* Last name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
              />
            </div>
            
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            {/* Date of birth with date picker */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type={isEditing ? "date" : "text"}
                value={isEditing ? formatDateForInput(formData.dateOfBirth) : formatDateForDisplay(formData.dateOfBirth)}
                onChange={handleChange}
                disabled={!isEditing}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
              />
              {dobError && (
                <div className="text-red-600 text-sm flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {dobError}
                </div>
              )}
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">You must be at least 16 years old</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-rose-500 font-medium mb-4">Your Username and Password</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex space-x-2">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    disabled={true}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowUsernameChange(true)}
                  >
                    Change
                  </Button>
                </div>
              </div>
              
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
                disabled={isLoading || !!dobError}
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
        
        {showUsernameChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-medium mb-4">Change Username</h2>
              
              {usernameError && (
                <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{usernameError}</span>
                </div>
              )}
              
              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newUsername">New Username</Label>
                  <Input
                    id="newUsername"
                    name="newUsername"
                    type="text"
                    value={usernameData.newUsername}
                    onChange={handleUsernameChange}
                    required
                    className={usernameError ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Confirm with Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={usernameData.password}
                    onChange={handleUsernameChange}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowUsernameChange(false);
                      setUsernameError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Username'}
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
