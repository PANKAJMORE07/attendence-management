'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: '',
    class: 'TY',
    subject: 'Database',
    timing: '10:00 AM - 11:00 AM'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(formData).toString();
    router.push(`/mark-attendance?${queryParams}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold text-center text-blue-500 mb-8">
          Attendance Manager
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-lg mb-2">Select Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-black"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-lg mb-2">Select Class</label>
            <select 
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-black"
            >
              <option value="TY">TY</option>
              <option value="SY">SY</option>
              {/* Add more options as needed */}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-lg mb-2">Select Subject</label>
            <select 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-black"
            >
              <option value="Database">Database</option>
              <option value="TOC">TOC</option>
              <option value="SE">SE</option>
              {/* Add more options as needed */}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-lg mb-2">Select Timing</label>
            <select 
              name="timing"
              value={formData.timing}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-black"
            >
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
              <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
              {/* Add more options as needed */}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}