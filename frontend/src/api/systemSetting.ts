import api from './apiClient';

export interface SystemSettingValue {
  time: number;
  format: string;
}

export interface SystemSettingResponse {
  id: number;
  key: string;
  value: SystemSettingValue;
  description: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: number;
}

export interface SystemSettingApiResponse {
  message: string;
  data: SystemSettingResponse;
}

export const getSystemSettingByKey = async (key: string): Promise<SystemSettingApiResponse> => {
  const response = await api.get('/api/main/system-settings', {
    params: { key },
  });
  return response.data;
};

