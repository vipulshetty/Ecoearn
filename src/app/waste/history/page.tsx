'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface WasteSubmission {
  _id: string;
  type: string;
  weight: number;
  status: string;
  points: number;
  createdAt: string;
  description?: string;
  assignedTrader?: {
    name: string;
    phone: string;
  };
}

export default function WasteHistoryPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<WasteSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get('/api/waste', {
          params: { userId: session?.user?.id }
        });
        setSubmissions(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchSubmissions();
    }
  }, [session?.user?.id]);

  if (!session) {
    return (
      <div className="text-center p-4">
        Please sign in to view your submissions
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Waste Submission History
      </h1>

      {submissions.length === 0 ? (
        <p className="text-center text-gray-600">
          No submissions found
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => (
            <div key={submission._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold capitalize">
                    {submission.type}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                  submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  submission.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {submission.status}
                </span>
              </div>

              <div className="space-y-2">
                <p>Weight: {submission.weight} kg</p>
                <p>Points Earned: {submission.points}</p>
                {submission.description && (
                  <p className="text-sm text-gray-600">
                    {submission.description}
                  </p>
                )}
              </div>

              {submission.assignedTrader && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium">Assigned Trader</h4>
                  <p className="text-sm">{submission.assignedTrader.name}</p>
                  <p className="text-sm">{submission.assignedTrader.phone}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
