import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import Header from '../../components/header';
import Footer from '../../components/footer';

interface AppointmentFormData {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  service: string;
  message: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const Appointment: React.FC = () => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    startTime: '',
    endTime: '',
    service: 'Wedding Planning',
    message: '',
  });
  const [notification, setNotification] = useState<Notification | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);
    
    try {
      // Format date for backend
      const formattedData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        // Combine start and end time into one field for backend
        time: `${formData.startTime} to ${formData.endTime}`
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      // Success message
      setNotification({
        type: 'success',
        message: 'Your appointment request has been submitted. We will contact you shortly.'
      });
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        date: '',
        startTime: '',
        endTime: '',
        service: 'Wedding Planning',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setNotification({
        type: 'error',
        message: `Failed to submit appointment: ${error.message}`
      });
    } finally {
      setSubmitting(false);
      // Scroll to top to show notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // List of services matching the dropdown in the header
  const services = [
    'Wedding Planning',
    'Photography',
    'Venue Booking',
    'Catering Services',
    'Decoration',
    'Wedding Cars',
  ];

  // Available time slots from 9:00 AM to 5:00 PM
  const timeSlots = [
    '9:00 AM', 
    '9:30 AM', 
    '10:00 AM', 
    '10:30 AM', 
    '11:00 AM', 
    '11:30 AM', 
    '12:00 PM', 
    '12:30 PM',
    '1:00 PM', 
    '1:30 PM', 
    '2:00 PM', 
    '2:30 PM', 
    '3:00 PM', 
    '3:30 PM', 
    '4:00 PM', 
    '4:30 PM',
    '5:00 PM'
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto flex-grow px-4 py-8">
        {/* Notification */}
        {notification && (
          <div 
            className={`p-4 mb-6 rounded-lg flex items-center ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 mr-2" />
            )}
            <p>{notification.message}</p>
            <button 
              className="ml-auto text-gray-500 hover:text-gray-700"
              onClick={() => setNotification(null)}
            >
              &times;
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Image with Info */}
          <div className="relative rounded-lg overflow-hidden h-full">
            <img
              src="https://i.pinimg.com/736x/96/bd/5e/96bd5ea5e7af665c65e75404be4d8b86.jpg"
              alt="Wedding consultation"
              className="w-full h-full object-cover brightness-75"
            />
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 text-white">
              <h2 className="text-2xl font-medium mb-6">Book Your Consultation</h2>
              <p className="mb-6">Schedule a personal appointment with our wedding experts to discuss your dream wedding.</p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5" />
                  <p>Available Monday to Saturday</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5" />
                  <p>9:00 AM - 5:00 PM</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" />
                  <p>Call: +1-234-9898</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <p>Email: enchanted@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Appointment Form */}
          <div className="space-y-6">
            <h1 className="text-3xl font-medium text-[#c3937c]">Book an Appointment</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-[#c3937c] mr-2" />
                  <label className="text-gray-700">Full Name</label>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Mail className="w-4 h-4 text-[#c3937c] mr-2" />
                  <label className="text-gray-700">Email</label>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  required
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Phone className="w-4 h-4 text-[#c3937c] mr-2" />
                  <label className="text-gray-700">Phone Number</label>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  required
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-[#c3937c] mr-2" />
                    <label className="text-gray-700">Preferred Date</label>
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                  />
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-[#c3937c] mr-2" />
                    <label className="text-gray-700">Preferred Time</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                    >
                      <option value="">From</option>
                      {timeSlots.slice(0, -1).map((time) => (
                        <option 
                          key={time} 
                          value={time}
                          disabled={formData.endTime && timeSlots.indexOf(time) >= timeSlots.indexOf(formData.endTime)}
                        >
                          {time}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500">to</span>
                    <select
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                      className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                    >
                      <option value="">To</option>
                      {timeSlots.slice(1).map((time) => (
                        <option 
                          key={time} 
                          value={time}
                          disabled={formData.startTime && timeSlots.indexOf(time) <= timeSlots.indexOf(formData.startTime)}
                        >
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700">Service</label>
                </div>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <MessageSquare className="w-4 h-4 text-[#c3937c] mr-2" />
                  <label className="text-gray-700">Message</label>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your requirements"
                  rows={4}
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 bg-[#fbf8f1] text-[#c3937c] font-medium rounded-lg hover:bg-[#ead9c9] transition-colors ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Submitting...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Appointment; 