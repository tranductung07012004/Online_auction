import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import Footer from '../../components/footer';
import { Button } from '../../components/button';
import { PlusCircle } from 'lucide-react';
import { AddressCard, type AddressData } from './profile/address-card';
import { AddressFormDialog } from './profile/address-form-dialog';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../api/user';
import { UserProfile } from '../../api/user';

export default function AddressPage() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/users/addresses', { withCredentials: true });
      if (response.data.success) {
        const addressData = response.data.data;
        setAddresses(addressData.addresses || []);
        setDefaultAddressId(addressData.defaultAddressId || null);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your addresses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setUserData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses]);

  const handleAddAddress = useCallback(
    async (addressData: Omit<AddressData, 'id'>) => {
      try {
        const response = await axios.post(
          'http://localhost:3000/users/addresses',
          {
            address: {
              firstName: addressData.firstName,
              lastName: addressData.lastName,
              company: addressData.company || '',
              address: addressData.address,
              apartment: addressData.apartment || '',
              city: addressData.city,
              province: addressData.province,
              postalCode: addressData.postalCode,
              phone: addressData.phone,
              country: addressData.country,
            },
            setAsDefault: addresses.length === 0 // Set as default if it's the first address
          },
          { withCredentials: true }
        );
        
        if (response.data.success) {
          // Refresh addresses after adding
          fetchAddresses();
          toast({ 
            title: 'Address added', 
            description: 'Your new address has been added successfully.' 
          });
        }
      } catch (error) {
        console.error('Error adding address:', error);
        toast({
          title: 'Error',
          description: 'Failed to add address',
          variant: 'destructive',
        });
      }
    },
    [addresses.length, fetchAddresses, toast]
  );

  const handleEditAddress = useCallback(
    (address: AddressData) => {
      setEditingAddress(address);
    },
    []
  );

  const handleSaveEdit = useCallback(
    async (updatedAddressData: Omit<AddressData, 'id'>) => {
      if (!editingAddress) return;

      try {
        const response = await axios.put(
          'http://localhost:3000/users/addresses',
          {
            addressId: editingAddress.id,
            address: {
              firstName: updatedAddressData.firstName,
              lastName: updatedAddressData.lastName,
              company: updatedAddressData.company || '',
              address: updatedAddressData.address,
              apartment: updatedAddressData.apartment || '',
              city: updatedAddressData.city,
              province: updatedAddressData.province,
              postalCode: updatedAddressData.postalCode,
              phone: updatedAddressData.phone,
              country: updatedAddressData.country,
            }
          },
          { withCredentials: true }
        );
        
        if (response.data.success) {
          // Refresh addresses after updating
          fetchAddresses();
          setEditingAddress(null);
          toast({ 
            title: 'Address updated', 
            description: 'Your address has been updated successfully.' 
          });
        }
      } catch (error) {
        console.error('Error updating address:', error);
        toast({
          title: 'Error',
          description: 'Failed to update address',
          variant: 'destructive',
        });
      }
    },
    [editingAddress, fetchAddresses, toast]
  );

  const handleDeleteAddress = useCallback(
    async (id: string) => {
      try {
        const response = await axios.delete(
          'http://localhost:3000/users/addresses',
          { 
            data: { addressId: id },
            withCredentials: true 
          }
        );
        
        if (response.data.success) {
          // Refresh addresses after deleting
          fetchAddresses();
          toast({ 
            title: 'Address deleted', 
            description: 'Your address has been deleted successfully.' 
          });
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete address',
          variant: 'destructive',
        });
      }
    },
    [fetchAddresses, toast]
  );

  const handleSetDefaultAddress = useCallback(
    async (id: string) => {
      try {
        const response = await axios.put(
          'http://localhost:3000/users/addresses/default',
          { addressId: id },
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setDefaultAddressId(id);
          toast({ 
            title: 'Default address set', 
            description: 'Your default address has been updated.' 
          });
        }
      } catch (error) {
        console.error('Error setting default address:', error);
        toast({
          title: 'Error',
          description: 'Failed to set default address',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="address"
              userName={userData ? userData.username : 'User'}
              userImage={userData?.profileImageUrl}
              fullName={userData ? `${userData.firstName} ${userData.lastName}` : undefined}
            />
          </div>

          <div className="md:col-span-2 bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-medium">My Address</h1>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
                className="text-[#c3937c] border-[#c3937c] hover:bg-[#c3937c] hover:text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add new address
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#c3937c]"></div>
              </div>
            ) : (
              <div className="divide-y">
                {addresses.map(address => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={() => handleEditAddress(address)}
                    onDelete={() => handleDeleteAddress(address.id)}
                    onSetDefault={() => handleSetDefaultAddress(address.id)}
                    isDefault={address.id === defaultAddressId}
                  />
                ))}

                {addresses.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">You don't have any saved addresses yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <AddressFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddAddress}
        title="Add New Address"
      />

      {editingAddress && (
        <AddressFormDialog
          open={!!editingAddress}
          onOpenChange={open => !open && setEditingAddress(null)}
          onSave={handleSaveEdit}
          initialData={{
            firstName: editingAddress.firstName,
            lastName: editingAddress.lastName,
            company: editingAddress.company,
            address: editingAddress.address,
            apartment: editingAddress.apartment,
            city: editingAddress.city,
            province: editingAddress.province,
            postalCode: editingAddress.postalCode,
            phone: editingAddress.phone,
            country: editingAddress.country,
          }}
          title="Edit Address"
        />
      )}

      <Footer />
    </div>
  );
}
