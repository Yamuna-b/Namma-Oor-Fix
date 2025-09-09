import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name || formData.username
      });

      if (response.data.status === 'success') {
        login(response.data.data.user, response.data.token);
        navigate('/home');
      }
    } catch (err) {
      console.error('Registration error:', err);

      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to the server. Please make sure the backend is running.');
      } else if (err.response?.status === 404) {
        setError('Registration endpoint not found. Please check your backend routes.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-red-500 to-yellow-400 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg p-6 sm:p-6">
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          Create your account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-200 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <input
            name="username"
            type="text"
            required
            placeholder="Username"
            className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:text-sm"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:text-sm"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            name="name"
            type="text"
            placeholder="Full Name (optional)"
            className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:text-sm"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Password (min. 6 characters)"
            className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:text-sm"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            name="confirmPassword"
            type="password"
            required
            placeholder="Confirm Password"
            className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 sm:text-sm"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-gradient-to-r from-red-500 to-yellow-400 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <p className="text-center text-sm text-white/80">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-yellow-200 hover:text-yellow-100 font-medium"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
