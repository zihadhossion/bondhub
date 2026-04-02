import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppSelector';
import { setCredentials } from '../store/slices/authSlice';
import { authService } from '../services/api/auth.service';
import { userService } from '../services/api/user.service';

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.login({ email, password });
      const user = await userService.getMe();
      if (user.role !== 'admin') {
        setError('Access denied. Admin credentials required.');
        await authService.logout().catch(() => null);
        return;
      }
      dispatch(setCredentials(user));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1A' }}>
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">BondHub Admin</h1>
          <p className="text-sm text-[#6B7280]">Sign in to your admin account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#D1D5DB] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-[#ED1C24]"
              style={{ background: '#1A2035', border: '1px solid #2D3748' }}
              placeholder="admin@bondhub.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#D1D5DB] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-[#ED1C24]"
              style={{ background: '#1A2035', border: '1px solid #2D3748' }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-[#ED1C24]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
