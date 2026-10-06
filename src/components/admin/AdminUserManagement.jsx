import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import Button from '../common/Button';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { DataState, useCollectionView } from '../common/DataState';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const usersView = useCollectionView();
  const [actionError, setActionError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    is_active: true,
    role: 'user',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    usersView.start();
    try {
      const response = await adminService.getUsers(0, 100);
      const items = response.items || [];
      setUsers(items);
      usersView.succeed(items);
    } catch (err) {
      setUsers([]);
      await usersView.fail(err, 'Failed to load users');
    }
  };

  const handleEdit = (user) => {
    setCreatingUser(false);
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      password: '',
      is_active: user.is_active,
      role: user.role,
    });
  };

  const handleCreate = () => {
    setEditingUser(null);
    setCreatingUser(true);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (creatingUser) {
        await adminService.createUser({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          role: formData.role,
        });
        setCreatingUser(false);
      } else {
        await adminService.updateUser(editingUser.id, {
          email: formData.email,
          full_name: formData.full_name,
          is_active: formData.is_active,
          role: formData.role,
        });
        setEditingUser(null);
      }
      resetForm();
      loadUsers();
    } catch (err) {
      const failure = await interpretApiError(err, 'Failed to save user');
      setActionError(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await adminService.deleteUser(userId);
      loadUsers();
    } catch (err) {
      const failure = await interpretApiError(err, 'Failed to delete user');
      setActionError(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
    }
  };

  const copyUserId = async (userId) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedId(userId);
      window.setTimeout(() => setCopiedId((current) => (current === userId ? null : current)), 1500);
    } catch {
      setActionError('Could not copy the user ID');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      password: '',
      is_active: true,
      role: 'user',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Public signup creates student accounts. Administrators are created here.
          </p>
        </div>
        <Button type="button" onClick={handleCreate}>
          Create user
        </Button>
      </div>

      {actionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded" role="alert">
          {actionError}
        </div>
      )}

      {(editingUser || creatingUser) && (
        <Card className="mb-6">
          <h3 className="text-xl font-semibold mb-4">{creatingUser ? 'Create user' : 'Edit User'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {creatingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit">{creatingUser ? 'Create user' : 'Update User'}</Button>
              <Button
                type="button"
                onClick={() => { setEditingUser(null); setCreatingUser(false); resetForm(); }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <DataState
        status={usersView.status}
        message={usersView.message}
        onRetry={loadUsers}
        loading={<div className="text-center py-8">Loading users...</div>}
        empty={(
          <EmptyState
            icon="students"
            title="No users yet"
            description="Create a user when you need another student or administrator account. Public signup still creates student accounts."
          />
        )}
      >
      <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.full_name || user.email}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    {!user.is_active && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">User ID:</span>
                    <span className="font-mono break-all">{user.id}</span>
                    <button
                      type="button"
                      onClick={() => copyUserId(user.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {copiedId === user.id ? 'Copied' : 'Copy'}
                    </button>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    onClick={() => handleEdit(user)}
                    className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>
      </DataState>
    </div>
  );
};

export default AdminUserManagement;
