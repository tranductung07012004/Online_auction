import React from 'react';
import { MoreVertical, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/dropdown-menu';

export interface AddressData {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  country: string;
}

interface AddressCardProps {
  address: AddressData;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
  isDefault?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onSetDefault, isDefault }) => {
  return (
    <div className="mb-4">
      <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">
                    {address.firstName} {address.lastName}
                  </p>
                  {isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Default
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700">
                  <span className="font-medium">Address:</span> {address.address}
                  {address.apartment && `, ${address.apartment}`}
                </p>
                <p className="text-gray-700">
                  {address.city}, {address.province}, {address.country}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Postal code:</span> {address.postalCode}
                </p>
                {address.company && (
                  <p className="text-gray-700">
                    <span className="font-medium">Company:</span> {address.company}
                  </p>
                )}
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span> {address.phone}
                </p>
              </div>
            </div>
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                  <span className="sr-only">More options</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
                {onSetDefault && !isDefault && (
                  <DropdownMenuItem onClick={onSetDefault}>Set as default</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
