import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogistics, type ContextUser } from '../../contexts/LogisticsContext';
import { loginUser, registerUser } from '../../api';
import NetworkCanvas from '../common/NetworkCanvas';

export default function AuthView() {
  const navigate = useNavigate();
  const { loginWithAuth } = useLogistics();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('manager@logistics.in');
  const [username, setUsername] = useState('manager_ops');
  const [fullName, setFullName] = useState('Operations Manager');
  const [password, setPassword] = useState('manager123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'manager' | 'admin'>('manager');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick 1-click Demo Role Selector
  const handleRoleSelect = (role: 'admin' | 'manager' | 'customer') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'admin') {
      setEmail('admin@logistics.in');
      setUsername('superadmin');
      setFullName('Superadmin Lead');
      setPassword('admin123');
    } else if (role === 'manager') {
      setEmail('manager@logistics.in');
      setUsername('manager_ops');
      setFullName('Warehouse Operations Manager');
      setPassword('manager123');
    } else {
      setEmail('customer@client.in');
      setUsername('client_demo');
      setFullName('Enterprise Freight Customer');
      setPassword('customer123');
    }
  };

  const validate = (): boolean => {
    setError(null);
    if (!email.trim()) {
      setError('Email or user identity is required.');
      return false;
    }
    if (mode === 'register' && !username.trim()) {
      setError('Please provide a unique username.');
      return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        loginWithAuth(res.user as ContextUser, res.token);
        navigate('/dashboard');
      } else {
        const res = await registerUser({
          username: username.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          full_name: fullName.trim() || username.trim()
        });
        loginWithAuth(res.user as ContextUser, res.token);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('Auth notice:', errMsg);
      // Fallback for local demo or when offline
      if (errMsg.includes('Failed to fetch') || errMsg.includes('offline')) {
        const fallbackUser: ContextUser = {
          id: selectedRole === 'admin' ? 1 : selectedRole === 'manager' ? 2 : 3,
          username: username || email.split('@')[0] || 'operator',
          email,
          role: selectedRole,
          full_name: fullName || 'Demo Logistics User'
        };
        loginWithAuth(fallbackUser, 'mock-jwt-token-local');
        navigate('/dashboard');
      } else {
        setError(errMsg || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080a] text-[#eef2e6] font-sans flex flex-col lg:flex-row selection:bg-[#c8ff2e] selection:text-[#06080a]">
      {/* LEFT VISUAL SIDE: Real-Time Network Canvas */}
      <div className="relative lg:w-1/2 bg-[#0d1114] border-b lg:border-b-0 lg:border-r border-white/10 p-8 sm:p-12 flex flex-col justify-between overflow-hidden min-h-[380px] lg:min-h-screen">
        <div className="absolute inset-0 opacity-80 pointer-events-none">
          <NetworkCanvas ambientTrucks={8} showLabels={true} padding={36} />
        </div>

        <div className="relative z-10">
          <Link to="/" className="logo">
            <s />
            <span className="font-extrabold text-base tracking-tight font-['Syne']">LOGISTICS//PRO</span>
          </Link>
        </div>

        <div className="relative z-10 pt-16">
          <p className="font-mono text-xs uppercase tracking-widest text-[#c8ff2e] mb-2 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c8ff2e] animate-pulse" />
            Control Tower Gateway
          </p>
          <h2 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
            ENTER THE<br /><span className="text-[#c8ff2e]">NETWORK.</span>
          </h2>
          <p className="font-mono text-xs text-[#7f8a79] mt-4 max-w-sm">
            Autonomous Pan-India shortest-path engine, real-time warehouse inventory, and multi-database telemetry.
          </p>
        </div>
      </div>

      {/* RIGHT CONSOLE SIDE: Authentication Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="max-w-md w-full space-y-6">
          
          {/* Mode Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                Security Protocol
              </span>
              <h1 className="font-['Syne'] font-extrabold uppercase text-3xl tracking-tight">
                {mode === 'login' ? 'Console Sign In' : 'Register Operator'}
              </h1>
            </div>
            
            <div className="flex bg-[#0d1114] border border-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'login' ? 'bg-[#c8ff2e] text-[#0a0d05]' : 'text-[#7f8a79] hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'register' ? 'bg-[#c8ff2e] text-[#0a0d05]' : 'text-[#7f8a79] hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* 1-Click Role Switcher */}
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-[#7f8a79] block mb-2 font-bold">
              Select Operator Role (1-Click Preset)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-3 rounded-xl font-bold text-xs uppercase font-mono border transition ${
                  selectedRole === 'admin'
                    ? 'bg-[#c8ff2e] text-[#0a0d05] border-[#c8ff2e]'
                    : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('manager')}
                className={`py-2 px-3 rounded-xl font-bold text-xs uppercase font-mono border transition ${
                  selectedRole === 'manager'
                    ? 'bg-[#c8ff2e] text-[#0a0d05] border-[#c8ff2e]'
                    : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('customer')}
                className={`py-2 px-3 rounded-xl font-bold text-xs uppercase font-mono border transition ${
                  selectedRole === 'customer'
                    ? 'bg-[#c8ff2e] text-[#0a0d05] border-[#c8ff2e]'
                    : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                Customer
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-[#ff5a1f]/10 border border-[#ff5a1f]/30 rounded-xl flex items-center gap-2.5 text-[#ff5a1f] text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="input-dark text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ops_user"
                    className="input-dark text-xs"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                Email Identity
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@logistics.in"
                className="input-dark text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark text-xs pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f8a79] hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-volt primary py-3.5 text-xs font-extrabold uppercase tracking-wider justify-center mt-2 disabled:opacity-50"
              data-mag
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Enter Console →' : 'Create & Access Console →'}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="text-center pt-2">
            <Link to="/" className="font-mono text-xs text-[#7f8a79] hover:text-[#c8ff2e] transition">
              ← Return to LogisticsPro Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
