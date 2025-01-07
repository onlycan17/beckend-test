'use client';

import { useState, useMemo } from 'react';
import StudentList from '@/components/student/StudentList';
import ExamTimer from '@/components/teacher/ExamTimer';

export default function TeacherPage() {
  const examInfo = useMemo(() => ({
    academicYear: 2024,
    teacherId: 2,
    subjectCode: "2",
    episodeNumber: 2,
    classCode: "v23234",
    examQuestionSettingId: 3001
  }), []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">시험 모니터링 대시보드</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">시험 타이머</h2>
            <ExamTimer examQuestionSettingId={examInfo.examQuestionSettingId} />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">학생 접속 현황</h2>
            <StudentList 
              academicYear={examInfo.academicYear}
              teacherId={examInfo.teacherId}
              subjectCode={examInfo.subjectCode}
              episodeNumber={examInfo.episodeNumber}
              classCode={examInfo.classCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}