import { useState } from 'react';
import { Address } from '../types';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  country?: string;
}

const useAddressForm = (initialAddress?: Partial<Address>) => {
  const [formData, setFormData] = useState<Address>({
    firstName: initialAddress?.firstName || '',
    lastName: initialAddress?.lastName || '',
    company: initialAddress?.company || '',
    address: initialAddress?.address || '',
    apartment: initialAddress?.apartment || '',
    city: initialAddress?.city || '',
    province: initialAddress?.province || '',
    postalCode: initialAddress?.postalCode || '',
    phone: initialAddress?.phone || '',
    country: initialAddress?.country || '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // Validate city
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    // Validate province
    if (!formData.province.trim()) {
      newErrors.province = 'Province/State is required';
    }
    
    // Validate postal code
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Validate country
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmit: (formData: Address) => Promise<void>) => {
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Address form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      apartment: '',
      city: '',
      province: '',
      postalCode: '',
      phone: '',
      country: '',
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  };
};

export default useAddressForm; 