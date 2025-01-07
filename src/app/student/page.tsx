'use client';

import { useState, useEffect } from 'react';
import { markAttendance } from '@/app/actions/attendanceActions';
import { sendStudentPing } from '@/app/actions/examActions';
import ExamStatus from '@/components/student/ExamStatus';

export default function StudentPage() {
  const [studentInfo] = useState({
    studentId: 1,
    examQuestionSettingId: 3001,
    // 출석에 필요한 정보 추가
    academicYear: 2024,
    teacherId: 2,
    subjectCode: "2",
    episodeNumber: 2,
    classCode: "v23234"
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const markStudentAttendance = async () => {
      try {
        await markAttendance({
          academicYear: studentInfo.academicYear,
          teacherId: studentInfo.teacherId,
          subjectCode: studentInfo.subjectCode,
          episodeNumber: studentInfo.episodeNumber,
          classCode: studentInfo.classCode,
          studentId: studentInfo.studentId
        });
        
        // 출석 처리 후 ping도 함께 전송
        await sendStudentPing(studentInfo.examQuestionSettingId, studentInfo.studentId);
        console.log('출석 및 ping 처리 완료');
      } catch (err) {
        console.error('출석/ping 처리 실패:', err);
        setError(err instanceof Error ? err.message : '출석 처리 중 오류가 발생했습니다.');
      }
    };

    markStudentAttendance();
    const intervalId = setInterval(markStudentAttendance, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [studentInfo]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">시험 응시 화면</h1>
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <ExamStatus 
          studentId={studentInfo.studentId}
          examQuestionSettingId={studentInfo.examQuestionSettingId}
        />
      </div>
    </div>
  );
}