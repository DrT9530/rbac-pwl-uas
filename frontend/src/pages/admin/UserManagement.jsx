import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import api from '../../api/axios';
import { GLOBAL_ROLES } from '../../utils/constants';
import { getPrimaryRole, formatDate, getInitials } from '../../utils/permissions';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsers(data);
    } catch {
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/users', formData);
      showToast('User created successfully');
      setCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const payload = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) payload.password = formData.password;
      await api.put(`/users/${selectedUser.id}`, payload);
      showToast('User updated successfully');
      setEditModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/users/${selectedUser.id}`);
      showToast('User deleted successfully');
      setDeleteModal(false);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await api.post(`/users/${userId}/reset-password`);
      showToast('Password reset successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: getPrimaryRole(user),
    });
    setFormError('');
    setEditModal(true);
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold flex-shrink-0">
            {getInitials(row.name)}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (row) => <Badge role={getPrimaryRole(row)} size="sm" />,
    },
    {
      header: 'Created',
      render: (row) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleResetPassword(row.id)}
            className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
            title="Reset Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDelete(row)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage all system users and their roles
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setFormData({ name: '', email: '', password: '', role: 'user' });
            setFormError('');
            setCreateModal(true);
          }}
        >
          Add User
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Users table */}
      <Card padding={false}>
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2">
            <Table
              columns={columns}
              data={filteredUsers}
              emptyMessage="No users found"
            />
          </div>
        )}
      </Card>

      {/* Create user modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button loading={formLoading} onClick={handleCreate}>
              Create User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {formError}
            </div>
          )}
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="input-field"
            >
              {GLOBAL_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Edit user modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button loading={formLoading} onClick={handleEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {formError}
            </div>
          )}
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <Input
            label="New Password (leave empty to keep current)"
            type="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="input-field"
            >
              {GLOBAL_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete User"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={formLoading}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-900 font-medium">
            Are you sure you want to delete{' '}
            <span className="text-red-600">{selectedUser?.name}</span>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
