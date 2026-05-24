import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../api/axios';

export default function CreateAssignment() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        courseId: parseInt(courseId),
      };
      if (formData.dueDate) {
        payload.dueDate = new Date(formData.dueDate).toISOString();
      }
      await api.post('/assignments', payload);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create assignment'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter">
      {/* Back */}
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to course
      </button>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-accent-50">
            <FileText className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Create Assignment
            </h2>
            <p className="text-sm text-gray-500">
              Add a new assignment to this course
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 rounded-lg text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Assignment Title"
            placeholder="e.g. Midterm Exam, Project Proposal"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Input
            label="Description"
            type="textarea"
            placeholder="Describe the assignment requirements..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Input
            label="Due Date"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
          />

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Assignment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
