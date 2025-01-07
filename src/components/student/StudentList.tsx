'use client';

import { useEffect, useState, memo } from 'react';
import useStudentAttendance from '@/hooks/useStudentAttandance';

interface StudentListProps {
  academicYear: number;
  teacherId: number;
  subjectCode: string;
  episodeNumber: number;
  classCode: string;
}

interface Student {
  studentId: number;
  name: string;
  status: number;
  lastPing: string;
}

export default memo(function StudentList({
  academicYear,
  teacherId,
  subjectCode,
  episodeNumber,
  classCode
}: StudentListProps) {
  const { attendanceData, error, isLoading } = useStudentAttendance({
    academicYear,
    teacherId,
    subjectCode,
    episodeNumber,
    classCode
  });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="overflow-hidden">
      <div className="flow-root">
        <ul className="divide-y divide-gray-200">
          {attendanceData.map((student) => (
            <li key={student.studentId} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    마지막 접속: {new Date(student.lastPing).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${student.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {student.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
});