import React, { useState, useEffect } from 'react';

interface Submission {
  id: number;
  studentId: number;
  psaUrl: string;
  photoUrl: string;
  status: string;
  feedback?: string;
  awards: Award[];
}

interface Award {
  id: number;
  name: string;
  status: string;
  feedback?: string;
}

export const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();
      setSubmissions(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch submissions');
      setLoading(false);
    }
  };

  const handleVerification = async (submissionId: number, status: string, feedback: string) => {
    try {
      await fetch(`/api/submissions/${submissionId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          feedback,
          adminId: 1, // TODO: Get from auth context
        }),
      });
      fetchSubmissions(); // Refresh the list
    } catch (err) {
      setError('Failed to update submission status');
    }
  };

  const handleAwardVerification = async (awardId: number, status: string, feedback: string) => {
    try {
      await fetch(`/api/awards/${awardId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          feedback,
          adminId: 1, // TODO: Get from auth context
        }),
      });
      fetchSubmissions(); // Refresh the list
    } catch (err) {
      setError('Failed to update award status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Submission Review Dashboard</h1>
      
      <div className="space-y-6">
        {submissions.map((submission) => (
          <div key={submission.id} className="border rounded-lg p-4">
            <div className="flex gap-4 mb-4">
              {/* PSA Preview */}
              <div className="w-1/2">
                <h3 className="font-medium mb-2">PSA Document</h3>
                <img
                  src={submission.psaUrl}
                  alt="PSA Document"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
              
              {/* Photo Preview */}
              <div className="w-1/2">
                <h3 className="font-medium mb-2">Graduation Photo</h3>
                <img
                  src={submission.photoUrl}
                  alt="Graduation Photo"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            </div>

            {/* Awards Section */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Awards & Honors</h3>
              <div className="space-y-2">
                {submission.awards.map((award) => (
                  <div key={award.id} className="flex items-center gap-2">
                    <span className="flex-1">{award.name}</span>
                    <select
                      value={award.status}
                      onChange={(e) => handleAwardVerification(
                        award.id,
                        e.target.value,
                        ''
                      )}
                      className="p-1 border rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Submission Status */}
            <div className="flex items-center gap-4">
              <select
                value={submission.status}
                onChange={(e) => handleVerification(
                  submission.id,
                  e.target.value,
                  ''
                )}
                className="p-2 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
              
              {submission.feedback && (
                <p className="text-sm text-gray-600">{submission.feedback}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 