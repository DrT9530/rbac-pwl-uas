import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { formatDate, getInitials, getPrimaryRole } from '../../utils/permissions';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    assignments: 0,
    submissions: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, coursesRes, assignmentsRes] = await Promise.allSettled([
        api.get('/users'),
        api.get('/courses'),
        api.get('/assignments'),
      ]);

      const users =
        usersRes.status === 'fulfilled'
          ? Array.isArray(usersRes.value.data)
            ? usersRes.value.data
            : usersRes.value.data.data || []
          : [];
      const courses =
        coursesRes.status === 'fulfilled'
          ? Array.isArray(coursesRes.value.data)
            ? coursesRes.value.data
            : coursesRes.value.data.data || []
          : [];
      const assignments =
        assignmentsRes.status === 'fulfilled'
          ? Array.isArray(assignmentsRes.value.data)
            ? assignmentsRes.value.data
            : assignmentsRes.value.data.data || []
          : [];

      setStats({
        users: users.length,
        courses: courses.length,
        assignments: assignments.length,
        submissions: 0,
      });
      setRecentUsers(users.slice(0, 5));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats.users,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      color: 'text-blue-500',
      trend: '+12%',
    },
    {
      label: 'Total Courses',
      value: stats.courses,
      icon: BookOpen,
      gradient: 'from-accent-500 to-accent-600',
      bg: 'bg-accent-500/10',
      color: 'text-accent-500',
      trend: '+5%',
    },
    {
      label: 'Total Assignments',
      value: stats.assignments,
      icon: FileText,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
      color: 'text-purple-500',
      trend: '+8%',
    },
    {
      label: 'Submissions',
      value: stats.submissions,
      icon: CheckCircle,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      color: 'text-amber-500',
      trend: '+15%',
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your learning management system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/users">
            <Button icon={Plus} size="sm">
              Add User
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="secondary" icon={BookOpen} size="sm">
              Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card
            key={stat.label}
            className="animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stat.trend} this month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick actions + Recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Manage Users
                </p>
                <p className="text-xs text-gray-400">
                  Add, edit, or remove users
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              to="/courses"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-accent-500/10">
                <BookOpen className="w-4 h-4 text-accent-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Manage Courses
                </p>
                <p className="text-xs text-gray-400">
                  Create or manage courses
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </Card>

        {/* Recent users */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Recent Users
            </h3>
            <Link
              to="/admin/users"
              className="text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-4 animate-pulse"
                  >
                    <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              : recentUsers.map((u) => {
                  const role = getPrimaryRole(u);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold flex-shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {u.email}
                        </p>
                      </div>
                      <Badge role={role} size="xs" />
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  );
                })}
            {!loading && recentUsers.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                No users found
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
