import React from 'react';
import useAddressForm from '../hooks/useAddressForm';
import { Address } from '../types';

interface AddressFormProps {
  onSubmit: (formData: Address) => Promise<void>;
  initialAddress?: Partial<Address>;
  isLoading?: boolean;
  submitLabel?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit, 
  initialAddress,
  isLoading = false,
  submitLabel = 'Save & Continue'
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useAddressForm(initialAddress);
  
  const processing = isLoading || isSubmitting;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit);
      }}>
        <div className="grid grid-cols-1 gap-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`block w-full rounded-md border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`block w-full rounded-md border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company (Optional)
            </label>
            <input
              type="text"
              id="company"
              name="company"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
              value={formData.company}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address*
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className={`block w-full rounded-md border ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
              Apartment, suite, etc. (Optional)
            </label>
            <input
              type="text"
              id="apartment"
              name="apartment"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
              value={formData.apartment}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className={`block w-full rounded-md border ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province*
              </label>
              <input
                type="text"
                id="province"
                name="province"
                className={`block w-full rounded-md border ${
                  errors.province ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                value={formData.province}
                onChange={handleChange}
              />
              {errors.province && (
                <p className="mt-1 text-sm text-red-600">{errors.province}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code*
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                className={`block w-full rounded-md border ${
                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                value={formData.postalCode}
                onChange={handleChange}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                className={`block w-full rounded-md border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country*
            </label>
            <select
              id="country"
              name="country"
              className={`block w-full rounded-md border ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-[#c3937c] focus:outline-none focus:ring-1 focus:ring-[#c3937c]`}
              value={formData.country}
              onChange={handleChange}
            >
              <option value="">Select Country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="VN">Vietnam</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className={`rounded-md bg-[#c3937c] px-4 py-2 text-white font-medium shadow-sm hover:bg-[#a67c66] focus:outline-none focus:ring-2 focus:ring-[#c3937c] ${
              processing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {processing ? 'Processing...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm; 