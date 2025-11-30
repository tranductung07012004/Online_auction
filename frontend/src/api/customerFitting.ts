import api from './apiClient';

export interface Measurement {
  bust: number;
  waist: number;
  hips: number;
  height: number;
  shoulderWidth?: number;
  armLength?: number;
  legLength?: number;
  notes?: string;
}

export type PhotographyConcept = 'Traditional' | 'Modern' | 'Beach' | 'Garden' | 'Classic' | 'Vintage' | 'Artistic' | 'Minimalist';

export interface CustomerFitting {
  _id: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  measurements: Measurement;
  preferredStyles: string[];
  photographyConcept: PhotographyConcept;
  photoReferenceUrls: string[];
  status: 'pending' | 'in-progress' | 'completed';
  appointmentDate?: Date;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerFittingDto {
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  measurements: Measurement;
  preferredStyles: string[];
  photographyConcept: PhotographyConcept;
  photoReferenceUrls?: string[];
  status?: 'pending' | 'in-progress' | 'completed';
  appointmentDate?: Date;
  notes?: string;
}

export const getAllCustomerFittings = async (): Promise<CustomerFitting[]> => {
  const response = await api.get('/admin/customer-fittings');
  return response.data;
};

export const getCustomerFittingById = async (id: string): Promise<CustomerFitting> => {
  const response = await api.get(`/admin/customer-fittings/${id}`);
  return response.data;
};

export const createCustomerFitting = async (data: CreateCustomerFittingDto): Promise<CustomerFitting> => {
  const response = await api.post('/admin/customer-fittings', data);
  return response.data;
};

export const updateCustomerFitting = async (id: string, data: Partial<CreateCustomerFittingDto>): Promise<CustomerFitting> => {
  const response = await api.put(`/admin/customer-fittings/${id}`, data);
  return response.data;
};

export const deleteCustomerFitting = async (id: string): Promise<void> => {
  await api.delete(`/admin/customer-fittings/${id}`);
};

export const uploadPhotoReference = async (id: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/admin/customer-fittings/${id}/upload-photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.url;
}; 