import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  FileText,
  AlertCircle,
  CheckCircle,
  Link as LinkIcon,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/permissions';

export default function SubmitAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    fileUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data.data || res.data);

      try {
        const subRes = await api.get(`/assignments/${id}/submissions/me`);
        const sub = subRes.data.data || subRes.data;
        if (sub && sub.id) {
          setExistingSubmission(sub);
          setFormData({
            content: sub.content || '',
            fileUrl: sub.fileUrl || '',
          });
        }
      } catch {
        // No existing submission
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (existingSubmission) {
        await api.put(`/submissions/${existingSubmission.id}`, formData);
      } else {
        await api.post(`/assignments/${id}/submissions`, formData);
      }
      navigate(`/assignments/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit assignment'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter">
      {/* Back */}
      <button
        onClick={() => navigate(`/assignments/${id}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to assignment
      </button>

      {/* Assignment info */}
      {assignment && (
        <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-sm">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{assignment.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Due: {formatDateTime(assignment.dueDate)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Existing submission notice */}
      {existingSubmission && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <CheckCircle className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              You have already submitted this assignment
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Submitted on{' '}
              {formatDateTime(
                existingSubmission.createdAt || existingSubmission.submittedAt
              )}
              . You can update your submission below.
            </p>
          </div>
        </div>
      )}

      {/* Submission form */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Enter your answer or attach a file link
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 rounded-lg text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Submission Content"
            type="textarea"
            placeholder="Write your answer here..."
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />

          <Input
            label="File URL (optional)"
            type="url"
            icon={LinkIcon}
            placeholder="https://drive.google.com/..."
            value={formData.fileUrl}
            onChange={(e) =>
              setFormData({ ...formData, fileUrl: e.target.value })
            }
          />

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate(`/assignments/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} icon={Send}>
              {existingSubmission ? 'Update Submission' : 'Submit'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
