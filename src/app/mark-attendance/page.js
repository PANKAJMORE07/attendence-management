'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const SUBJECT_IDS = {
  'TOC': 1,
  'Database': 2,
  'SE': 3,
  'CN': 4,
  // Add other subjects as needed
};

export default function MarkAttendance() {
  const searchParams = useSearchParams();
  const [absentRolls, setAbsentRolls] = useState(new Set());
  const [firstLectureAbsentees, setFirstLectureAbsentees] = useState(new Set());
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    date: searchParams.get('date') || '',
    class: searchParams.get('class') || '',
    subject: searchParams.get('subject') || '',
    timing: searchParams.get('timing') || ''
  });

  // Fetch first lecture absentees
  useEffect(() => {
    const fetchFirstLectureAbsentees = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/attendance/first-lecture-absentees?date=${formData.date}&className=${formData.class}`
        );
        const data = await response.json();
        const absenteeSet = new Set(data.absentees);
        setFirstLectureAbsentees(absenteeSet);
        
        // Also mark these students as absent in the current attendance
        setAbsentRolls(prev => new Set([...prev, ...absenteeSet]));
      } catch (error) {
        console.error('Failed to fetch first lecture absentees:', error);
      }
    };

    if (formData.date && formData.class) {
      fetchFirstLectureAbsentees();
    }
  }, [formData.date, formData.class]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/attendance/students/${formData.class}`);
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };

    if (formData.class) {
      fetchStudents();
    }
  }, [formData.class]);

  const toggleAttendance = (rollNo) => {
    // Don't allow toggling if student was absent in first lecture
    if (firstLectureAbsentees.has(rollNo)) {
      alert('This student was absent in the first lecture and cannot be marked present.');
      return;
    }

    const newAbsent = new Set(absentRolls);
    if (newAbsent.has(rollNo)) {
      newAbsent.delete(rollNo);
    } else {
      newAbsent.add(rollNo);
    }
    setAbsentRolls(newAbsent);
  };

  const handleSubmit = async () => {
    try {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        isPresent: !absentRolls.has(student.rollNo)
      }));

      const subjectId = SUBJECT_IDS[formData.subject];

      if (!subjectId) {
        alert(`Invalid subject: ${formData.subject}. Please contact administrator.`);
        return;
      }

      const response = await fetch('http://localhost:5001/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          time: formData.timing,
          subjectId: subjectId,
          className: formData.class,
          attendanceData
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : 'attendance.xlsx';
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert('Attendance marked successfully!');
      } else {
        alert('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto p-6">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-center flex-1 text-blue-500">Mark Attendance</h1>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Date:</p>
              <p className="font-semibold">{formData.date}</p>
            </div>
            <div>
              <p className="text-gray-600">Class:</p>
              <p className="font-semibold">{formData.class}</p>
            </div>
            <div>
              <p className="text-gray-600">Subject:</p>
              <p className="font-semibold">{formData.subject}</p>
            </div>
            <div>
              <p className="text-gray-600">Time:</p>
              <p className="font-semibold">{formData.timing}</p>
            </div>
          </div>
        </div>


        {/* Students Grid */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {students.map((student) => {
            const isFirstLectureAbsentee = firstLectureAbsentees.has(student.rollNo);
            return (
              <button
                key={student.rollNo}
                onClick={() => toggleAttendance(student.rollNo)}
                disabled={isFirstLectureAbsentee}
                className={`
                  aspect-square rounded-full flex items-center justify-center text-lg 
                  transition-all duration-200 ease-in-out
                  ${isFirstLectureAbsentee 
                    ? 'bg-red-800 text-white cursor-not-allowed' // Dark red for first lecture absentees
                    : absentRolls.has(student.rollNo)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }
                  transform hover:scale-105
                `}
              >
                {student.rollNo}
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg 
                   hover:bg-blue-600 transition-colors"
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
} 