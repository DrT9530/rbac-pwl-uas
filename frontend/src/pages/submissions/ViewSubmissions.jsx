import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Star,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import api from '../../api/axios';
import { formatDateTime, getInitials } from '../../utils/permissions';

export default function ViewSubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeModal, setGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [toast, setToast] = useState(null);

  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [assignRes, subRes] = await Promise.allSettled([
        api.get(`/assignments/${id}`),
        api.get(`/assignments/${id}/submissions`),
      ]);
      if (assignRes.status === 'fulfilled') {
        setAssignment(assignRes.value.data.data || assignRes.value.data);
      }
      if (subRes.status === 'fulfilled') {
        const data = Array.isArray(subRes.value.data)
          ? subRes.value.data
          : subRes.value.data.data || [];
        setSubmissions(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const openGrade = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade ?? '',
      feedback: submission.feedback || '',
    });
    setGradeError('');
    setGradeModal(true);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setGradeLoading(true);
    setGradeError('');
    try {
      await api.put(`/submissions/${selectedSubmission.id}/grade`, {
        grade: parseInt(gradeForm.grade),
        feedback: gradeForm.feedback,
      });
      showToast('Grade saved successfully');
      setGradeModal(false);
      fetchData();
    } catch (err) {
      setGradeError(
        err.response?.data?.message || 'Failed to save grade'
      );
    } finally {
      setGradeLoading(false);
    }
  };

  const columns = [
    {
      header: 'Student',
      render: (row) => {
        const student = row.user || row.student || {};
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {getInitials(student.name)}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {student.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400">
                {student.email || ''}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Submitted',
      render: (row) => (
        <span className="text-sm text-gray-500">
          {formatDateTime(row.createdAt || row.submittedAt)}
        </span>
      ),
    },
    {
      header: 'Content',
      render: (row) => (
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {row.content || (row.fileUrl ? '📎 File attached' : '-')}
        </p>
      ),
    },
    {
      header: 'Grade',
      render: (row) =>
        row.grade !== null && row.grade !== undefined ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <Star className="w-3.5 h-3.5" />
            {row.grade}/100
          </span>
        ) : (
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
            Not graded
          </span>
        ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button size="sm" variant="secondary" onClick={() => openGrade(row)}>
          {row.grade !== null && row.grade !== undefined ? 'Edit Grade' : 'Grade'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-100 text-red-700'
              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)}>
            <X className="w-4 h-4 opacity-50" />
          </button>
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => navigate(`/assignments/${id}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to assignment
      </button>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
        {assignment && (
          <p className="text-gray-500 text-sm mt-1">
            {assignment.title} — {submissions.length} submissions
          </p>
        )}
      </div>

      {/* Table */}
      <Card padding={false}>
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2">
            <Table
              columns={columns}
              data={submissions}
              emptyMessage="No submissions yet"
            />
          </div>
        )}
      </Card>

      {/* Grade modal */}
      <Modal
        isOpen={gradeModal}
        onClose={() => setGradeModal(false)}
        title="Grade Submission"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGradeModal(false)}>
              Cancel
            </Button>
            <Button loading={gradeLoading} onClick={handleGrade}>
              Save Grade
            </Button>
          </>
        }
      >
        <form onSubmit={handleGrade} className="space-y-4">
          {gradeError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {gradeError}
            </div>
          )}

          {/* Student info */}
          {selectedSubmission && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700">
                {selectedSubmission.user?.name ||
                  selectedSubmission.student?.name ||
                  'Student'}
              </p>
              {selectedSubmission.content && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                  {selectedSubmission.content}
                </p>
              )}
            </div>
          )}

          <Input
            label="Grade (0-100)"
            type="number"
            min="0"
            max="100"
            placeholder="Enter grade"
            value={gradeForm.grade}
            onChange={(e) =>
              setGradeForm({ ...gradeForm, grade: e.target.value })
            }
            required
          />
          <Input
            label="Feedback (optional)"
            type="textarea"
            placeholder="Provide feedback to the student..."
            value={gradeForm.feedback}
            onChange={(e) =>
              setGradeForm({ ...gradeForm, feedback: e.target.value })
            }
          />
        </form>
      </Modal>
    </div>
  );
}
