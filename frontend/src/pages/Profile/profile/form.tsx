import React, { useState } from 'react';
import { Button } from '../../../components/button';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import { UpdateProfileData } from '../../../api/user';
import { updateFullname, updateEmail, updatePassword as updatePasswordApi, updateAddress } from '../../../api/profileApi';
import { useAuthStore } from '../../../stores/authStore';
import { AlertCircle } from 'lucide-react';

interface ProfileData {
  fullName: string;
  email: string;
  password: string;
  profileImageUrl?: string;
  address?: string;
}

interface ProfileFormProps {
  initialData: ProfileData;
  onProfileUpdate?: (updatedData: UpdateProfileData) => void;
}

export default function ProfileForm({ initialData, onProfileUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const getRoleFromCookie = useAuthStore((state) => state.getRoleFromCookie);
  
  // For fullname change
  const [showFullnameChange, setShowFullnameChange] = useState<boolean>(false);
  const [fullnameData, setFullnameData] = useState({
    newFullname: '',
    password: '',
  });
  const [fullnameError, setFullnameError] = useState<string | null>(null);
  
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
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // For email change
  const [showEmailChange, setShowEmailChange] = useState<boolean>(false);
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // For address change
  const [showAddressChange, setShowAddressChange] = useState<boolean>(false);
  const [addressData, setAddressData] = useState({
    newAddress: '',
    password: '',
  });
  const [addressError, setAddressError] = useState<string | null>(null);

  const handleFullnameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFullnameData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types in the field
    if (name === 'newFullname') {
      setFullnameError(null);
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types in the field
    if (name === 'newEmail') {
      setEmailError(null);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types in the field
    if (name === 'newAddress') {
      setAddressError(null);
    }
  };

  const handleFullnameSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setFullnameError(null);
    
    try {
      await updateFullname({
        fullname: fullnameData.newFullname,
        password: fullnameData.password,
      });
      
      setSuccess('Full name updated successfully');
      setShowFullnameChange(false);
      
      // Update the form data with the new fullname
      setFormData(prev => ({ ...prev, fullName: fullnameData.newFullname }));
      
      if (onProfileUpdate) {
        onProfileUpdate({ fullName: fullnameData.newFullname });
      }
      
      setFullnameData({
        newFullname: '',
        password: '',
      });
    } catch (err: any) {
      setFullnameError(err.message || 'Failed to update full name');
      setIsLoading(false);
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
    setPasswordError(null);
    setSuccess(null);
    
    try {
      await updatePasswordApi({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setSuccess('Password updated successfully');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({ confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
      setIsLoading(false);
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
      await updateEmail({
        newEmail: emailData.newEmail,
        password: emailData.password,
      });
      
      // Refresh the token to update the email in the JWT
      await getRoleFromCookie();
      
      setSuccess('Email updated successfully');
      setShowEmailChange(false);
      
      // Update the form data with the new email
      setFormData(prev => ({ ...prev, email: emailData.newEmail }));
      
      // Note: UpdateProfileData only has fullName, so we skip onProfileUpdate for email
      // The page will refresh anyway to get updated data
      
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

  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setAddressError(null);
    
    try {
      await updateAddress({
        address: addressData.newAddress,
        password: addressData.password,
      });
      
      setSuccess('Address updated successfully');
      setShowAddressChange(false);
      
      // Update the form data with the new address
      setFormData(prev => ({ ...prev, address: addressData.newAddress }));
      
      setAddressData({
        newAddress: '',
        password: '',
      });
      
      // Note: Address is not in UpdateProfileData, so we skip onProfileUpdate
      // The parent component should refresh profile data if needed
    } catch (err: any) {
      setAddressError(err.message || 'Failed to update address');
      setIsLoading(false);
    } finally {
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

      <div className="space-y-8">
        {/* Full Name Section */}
        <div className="space-y-4 pb-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Full Name</Label>
              <p className="text-sm text-gray-500 mt-1">{formData.fullName || 'Not set'}</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setShowFullnameChange(true);
                setFullnameError(null);
                setError(null);
              }}
            >
              Change
            </Button>
          </div>
        </div>

        {/* Email Section */}
        <div className="space-y-4 pb-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Email</Label>
              <p className="text-sm text-gray-500 mt-1">{formData.email}</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setShowEmailChange(true);
                setEmailError(null);
                setError(null);
              }}
            >
              Change
            </Button>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-4 pb-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Password</Label>
              <p className="text-sm text-gray-500 mt-1">••••••••</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setShowPasswordChange(true);
                setPasswordError(null);
                setError(null);
              }}
            >
              Change
            </Button>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Address</Label>
              <p className="text-sm text-gray-500 mt-1">{formData.address || 'Not set'}</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setShowAddressChange(true);
                setAddressError(null);
                setError(null);
              }}
            >
              Change
            </Button>
          </div>
        </div>
        
        {/* Fullname Change Modal */}
        {showFullnameChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-medium mb-4">Change Full Name</h2>
              
              {fullnameError && (
                <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{fullnameError}</span>
                </div>
              )}
              
              <form onSubmit={handleFullnameSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentFullname">Current Full Name</Label>
                  <Input
                    id="currentFullname"
                    name="currentFullname"
                    type="text"
                    value={formData.fullName}
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newFullname">New Full Name</Label>
                  <Input
                    id="newFullname"
                    name="newFullname"
                    type="text"
                    value={fullnameData.newFullname}
                    onChange={handleFullnameChange}
                    required
                    placeholder="Enter new full name"
                    className={fullnameError ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullnamePassword">Confirm with Password</Label>
                  <Input
                    id="fullnamePassword"
                    name="password"
                    type="password"
                    value={fullnameData.password}
                    onChange={handleFullnameChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowFullnameChange(false);
                      setFullnameError(null);
                      setFullnameData({ newFullname: '', password: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Full Name'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Email Change Modal */}
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
                  <Label htmlFor="currentEmail">Current Email</Label>
                  <Input
                    id="currentEmail"
                    name="currentEmail"
                    type="email"
                    value={formData.email}
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New Email</Label>
                  <Input
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    value={emailData.newEmail}
                    onChange={handleEmailChange}
                    required
                    placeholder="Enter new email"
                    className={emailError ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailPassword">Confirm with Password</Label>
                  <Input
                    id="emailPassword"
                    name="password"
                    type="password"
                    value={emailData.password}
                    onChange={handleEmailChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowEmailChange(false);
                      setEmailError(null);
                      setEmailData({ newEmail: '', password: '' });
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

        {/* Password Change Modal */}
        {showPasswordChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-medium mb-4">Change Password</h2>
              
              {passwordError && (
                <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              
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
                    placeholder="Enter current password"
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
                    placeholder="Enter new password"
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
                    placeholder="Confirm new password"
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
                      setPasswordError(null);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
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

        {/* Address Change Modal */}
        {showAddressChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-medium mb-4">Change Address</h2>
              
              {addressError && (
                <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}
              
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAddress">Current Address</Label>
                  <Input
                    id="currentAddress"
                    name="currentAddress"
                    type="text"
                    value={formData.address || ''}
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAddress">New Address</Label>
                  <Input
                    id="newAddress"
                    name="newAddress"
                    type="text"
                    value={addressData.newAddress}
                    onChange={handleAddressChange}
                    required
                    placeholder="Enter new address"
                    className={addressError ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressPassword">Confirm with Password</Label>
                  <Input
                    id="addressPassword"
                    name="password"
                    type="password"
                    value={addressData.password}
                    onChange={handleAddressChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddressChange(false);
                      setAddressError(null);
                      setAddressData({ newAddress: '', password: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Address'}
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


