import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { Exam } from './types';
import { ExamRunner } from './ExamRunner';

export function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/exams/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load exam: ${response.status}`);
        }

        const examData = await response.json();
        setExam(examData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Exam</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-gray-600">
          <p>Exam not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <ExamRunner exam={exam} />
      </div>
    </div>
  );
}