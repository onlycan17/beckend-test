'use client';

import ExamCountdown from '@/components/ExamCountDown';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          시험 카운트다운 테스트
        </h1>
        <ExamCountdown examQuestionSettingId={1} />
      </div>
    </div>
  );
}