import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export interface Size {
  _id: string;
  label: string;
}

export interface Color {
  _id: string;
  name: string;
  hexCode: string;
}

export interface CustomerUser {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  role: 'user' | 'admin';
  status?: 'active' | 'inactive' | 'blocked';
}

export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  upcomingAppointments: number;
  totalRevenue: number;
  percentChange: {
    orders: number;
    customers: number;
    appointments: number;
    revenue: number;
  };
}

export interface MonthlySales {
  month: string;
  sales: number;
  profit: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  value: number;
}

// Get all sizes
export const getAllSizes = async (): Promise<Size[]> => {
  try {
    const response = await API.get('/admin/sizes');
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch sizes');
  } catch (error) {
    console.error('Error fetching sizes:', error);
    throw error;
  }
};

// Get all colors
export const getAllColors = async (): Promise<Color[]> => {
  try {
    const response = await API.get('/admin/colors');
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch colors');
  } catch (error) {
    console.error('Error fetching colors:', error);
    throw error;
  }
};

// Get all customers
export const getAllCustomers = async (): Promise<CustomerUser[]> => {
  try {
    const response = await API.get('/admin/customers');
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch customers');
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Get customer by ID
export const getCustomerById = async (id: string): Promise<CustomerUser> => {
  try {
    const response = await API.get(`/admin/customers/${id}`);
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch customer');
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw error;
  }
};

// Update customer status
export const updateCustomerStatus = async (id: string, status: 'active' | 'inactive' | 'blocked'): Promise<CustomerUser> => {
  try {
    const response = await API.put(`/admin/customers/${id}/status`, { status });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update customer status');
  } catch (error) {
    console.error(`Error updating customer ${id} status:`, error);
    throw error;
  }
};

// Delete customer
export const deleteCustomer = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await API.delete(`/admin/customers/${id}`);
    
    if (response.data && response.data.success) {
      return response.data;
    }
    
    throw new Error(response.data.message || 'Failed to delete customer');
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw error;
  }
};

// Get dashboard statistics
export const getDashboardStats = async (period: string = '30days'): Promise<DashboardStats> => {
  try {
    const response = await API.get(`/admin/dashboard/stats?period=${period}`);
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch dashboard statistics');
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
};

// Get monthly sales data
export const getMonthlySales = async (year: number = new Date().getFullYear()): Promise<MonthlySales[]> => {
  try {
    const response = await API.get(`/admin/dashboard/sales?year=${year}`);
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch monthly sales data');
  } catch (error) {
    console.error('Error fetching monthly sales data:', error);
    throw error;
  }
};

// Get top selling products
export const getTopProducts = async (limit: number = 5): Promise<TopProduct[]> => {
  try {
    const response = await API.get(`/admin/dashboard/products/top?limit=${limit}`);
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch top products');
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

// Photography booking statistics interfaces
export interface PhotographyBooking {
  _id: string;
  customerId: any; // Could be expanded to a User object when populated
  serviceId: any; // Could be expanded to a PhotographyService object when populated
  bookingDate: string;
  shootingDate: string;
  shootingTime: string;
  shootingLocation: string;
  additionalRequests?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhotographyBookingStatistics {
  totalBookings: number;
  bookingsByStatus: Record<string, number>;
  bookingsByPackageType: Array<{_id: string; count: number}>;
  bookingsByMonth: Array<{_id: number; count: number}>;
  recentBookings: PhotographyBooking[];
  avgBookingsPerMonth: number;
}

// Get photography booking statistics
export const getPhotographyBookingStatistics = async (): Promise<PhotographyBookingStatistics> => {
  try {
    const response = await API.get('/admin/photography/bookings/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching photography booking statistics:', error);
    throw error;
  }
};

// Get all photography bookings
export const getAllPhotographyBookings = async (params?: { 
  customerId?: string; 
  serviceId?: string; 
  status?: string;
}): Promise<PhotographyBooking[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `/admin/photography/bookings${queryString ? `?${queryString}` : ''}`;
    
    const response = await API.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching all photography bookings:', error);
    throw error;
  }
};

// Update photography booking status
export const updatePhotographyBookingStatus = async (bookingId: string, status: string): Promise<PhotographyBooking> => {
  try {
    const response = await API.put(`/admin/photography/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating photography booking status:', error);
    throw error;
  }
};

// Contact API functions
export const getAllContacts = async () => {
  try {
    const response = await API.get('/contacts');
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to fetch contacts');
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const getContactById = async (id) => {
  try {
    const response = await API.get(`/contacts/${id}`);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to fetch contact');
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
};

export const createContact = async (contactData) => {
  try {
    const response = await API.post('/contacts', contactData);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to create contact');
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
};

export const updateContact = async (id, contactData) => {
  try {
    const response = await API.patch(`/contacts/${id}`, contactData);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to update contact');
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
    const response = await API.delete(`/contacts/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

export const markContactAsContacted = async (id) => {
  try {
    const response = await API.patch(`/contacts/${id}/mark-contacted`);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to mark contact as contacted');
  } catch (error) {
    console.error('Error marking contact as contacted:', error);
    throw error;
  }
};

export const updateContactStatus = async (id, status) => {
  try {
    const response = await API.patch(`/contacts/${id}/status`, { status });
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to update contact status');
  } catch (error) {
    console.error('Error updating contact status:', error);
    throw error;
  }
}; 