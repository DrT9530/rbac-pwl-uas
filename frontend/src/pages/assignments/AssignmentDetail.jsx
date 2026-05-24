import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  ArrowLeft,
  BookOpen,
  Send,
  Eye,
  CheckCircle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import api from '../../api/axios';
import {
  formatDateTime,
  getUserCourseRole,
  canCreateAssignment,
} from '../../utils/permissions';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isAdmin } = usePermission();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const res = await api.get(`/assignments/${id}`);
      const data = res.data.data || res.data;
      setAssignment(data);

      // Try to fetch user's own submission
      try {
        const subRes = await api.get(`/assignments/${id}/submissions/me`);
        setSubmission(subRes.data.data || subRes.data);
      } catch {
        // No submission yet
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card className="text-center py-16">
        <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Assignment not found
        </h3>
        <button
          onClick={() => navigate(-1)}
          className="text-accent-600 text-sm font-medium"
        >
          ← Go back
        </button>
      </Card>
    );
  }

  const courseId = assignment.courseId;
  const courseRole = getUserCourseRole(user, courseId);
  const isDosen = courseRole === 'dosen' || courseRole === 'asdos' || isAdmin();
  const isPastDue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="space-y-6 page-enter">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Assignment header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-accent-50 flex-shrink-0">
              <FileText className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {assignment.title}
              </h1>
              {assignment.course && (
                <Link
                  to={`/courses/${courseId}`}
                  className="text-sm text-accent-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {assignment.course.name || assignment.course.title}
                </Link>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Due: {formatDateTime(assignment.dueDate)}
                </div>
                {isPastDue && (
                  <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                    Past due
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDosen && (
              <Link to={`/assignments/${id}/submissions`}>
                <Button variant="secondary" icon={Eye} size="sm">
                  View Submissions
                </Button>
              </Link>
            )}
            {!isDosen && !submission && (
              <Link to={`/assignments/${id}/submit`}>
                <Button icon={Send} size="sm">
                  Submit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
          {assignment.description || 'No description provided.'}
        </p>
      </Card>

      {/* Submission status (for students) */}
      {!isDosen && submission && (
        <Card>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-50">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Submission
              </h3>
              <p className="text-sm text-gray-500">
                Submitted on {formatDateTime(submission.createdAt || submission.submittedAt)}
              </p>

              {submission.content && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                  {submission.content}
                </div>
              )}

              {submission.fileUrl && (
                <div className="mt-3">
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent-600 hover:underline"
                  >
                    📎 View attached file
                  </a>
                </div>
              )}

              {submission.grade !== null && submission.grade !== undefined && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm font-medium text-blue-900">
                    Grade: {submission.grade}/100
                  </p>
                  {submission.feedback && (
                    <p className="text-sm text-blue-700 mt-1">
                      Feedback: {submission.feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
