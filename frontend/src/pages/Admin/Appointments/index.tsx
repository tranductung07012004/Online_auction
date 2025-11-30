import React, { useState, useEffect } from 'react';
import AdminLayout from "../AdminLayout";
import { Calendar, Clock, CheckCircle, XCircle, UserCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Create an API instance with credentials
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

interface Appointment {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      
      const response = await API.get('/appointment');
      console.log('Response status:', response.status);
      
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      console.error('Fetch error details:', err);
      setError('Error loading appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await API.put(`/appointment/${id}`, { status });
      
      // If response is successful, update the appointment in state
      console.log('Updated appointment:', response.data);

      // Update local state after successful API update
      setAppointments(
        appointments.map((appointment) =>
          appointment._id === id ? { ...appointment, status } : appointment
        )
      );
      
    } catch (err) {
      console.error('Update error details:', err);
      alert(`Failed to update appointment status: ${err.message}`);
    }
  };

  const filteredAppointments = selectedStatus === 'all'
    ? appointments
    : appointments.filter(appointment => appointment.status === selectedStatus);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
            <UserCheck className="w-4 h-4 mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center px-2 py-1 text-sm rounded-full bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Cancelled
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-[#c3937c]">Manage Appointments</h1>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === 'all'
                ? 'bg-[#c3937c] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedStatus('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === 'pending'
                ? 'bg-[#c3937c] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === 'confirmed'
                ? 'bg-[#c3937c] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedStatus('confirmed')}
          >
            Confirmed
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === 'completed'
                ? 'bg-[#c3937c] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedStatus('completed')}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedStatus === 'cancelled'
                ? 'bg-[#c3937c] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedStatus('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && <p className="text-gray-600">Loading appointments...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Appointments List */}
        {!loading && !error && (
          <>
            <div className="text-gray-600 mb-4">
              {filteredAppointments.length} appointments found
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-[#c3937c]">
                      {appointment.fullName}
                    </h2>
                    {getStatusBadge(appointment.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-4 h-4 mr-2 text-[#c3937c]" />
                      {formatDate(appointment.date)}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2 text-[#c3937c]" />
                      {appointment.time}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-medium">Service:</span> {appointment.service}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-medium">Contact:</span> {appointment.email}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-medium">Phone:</span> {appointment.phone}
                    </div>
                    {appointment.message && (
                      <div className="text-gray-700">
                        <span className="font-medium">Message:</span> {appointment.message}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                            className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && filteredAppointments.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments; 