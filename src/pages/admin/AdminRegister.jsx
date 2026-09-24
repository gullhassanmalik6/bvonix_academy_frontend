import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { validateEmail, validatePassword } from '../../utils/validators';
import api from '../../services/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    admin_secret: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.admin_secret) {
      newErrors.admin_secret = 'Admin secret is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      // Register with admin secret header
      const response = await api.post(
        '/auth/register',
        {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: 'admin',
        },
        {
          headers: {
            'X-Admin-Secret': formData.admin_secret,
          },
        }
      );

      // Auto-login after registration
      const loginResponse = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { access_token } = loginResponse.data;
      localStorage.setItem('token', access_token);

      const userResponse = await api.get('/auth/me');
      const userData = userResponse.data;
      localStorage.setItem('user', JSON.stringify(userData));

      navigate('/admin');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || error.response?.data?.detail || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <h1 className="text-3xl font-bold text-center mb-6">Admin Registration</h1>
        <p className="text-center text-gray-600 mb-6">
          Register a new admin account. You need the admin secret key.
        </p>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.full_name}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password (min 8 characters)"
            error={errors.password}
            required
          />

          <Input
            label="Admin Secret Key"
            type="password"
            name="admin_secret"
            value={formData.admin_secret}
            onChange={handleChange}
            placeholder="Enter admin secret key"
            error={errors.admin_secret}
            required
          />

          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? 'Creating admin account...' : 'Register as Admin'}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Login here
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500">
            Or{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              register as regular user
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminRegister;
