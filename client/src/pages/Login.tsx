import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If a user was redirected from a protected route, redirect back there after logging in
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast('Signed in successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to sign in. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="card-gradient max-w-md w-full p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative Blur Background Blob */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Enter your credentials to manage your posts and drafts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 disabled:shadow-none hover-lift duration-250 transition-all cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-550 dark:text-slate-400 mt-6 relative">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-500 dark:text-brand-400 hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
