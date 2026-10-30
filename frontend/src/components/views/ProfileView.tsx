import { useLogistics } from '../../contexts/LogisticsContext';
import { 
  Settings, 
  Lock, 
  Key, 
  CheckCircle2 
} from 'lucide-react';
import { 
  UserIcon, 
  LogoutIcon, 
  ShieldCheckIcon, 
  ActivityIcon 
} from 'lucide-animated';
import { useNavigate } from 'react-router-dom';
import { TypewriterText } from '../common/TypewriterText';
import { ScannedTitle } from '../common/ScannedTitle';

export default function ProfileView() {
  const { activityLogs, logout, login, role, user } = useLogistics();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSwitchRole = (newRole: 'admin' | 'manager' | 'customer') => {
    login(newRole);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip v">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2e] animate-ping" />
              Operator Security Console
            </span>
            <span className="font-mono text-xs text-[#7f8a79]">
              ● Scoped Privilege Matrix &amp; Session Controls
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              OPERATOR<br />
              <span className="text-[#c8ff2e]">PROFILE</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="OPERATOR PROFILE · AUTHENTICATED SESSION · ACCESS CONTROL MATRIX" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="btn-volt px-5 py-3 text-xs font-mono font-bold text-[#ff2d55] border-[#ff2d55]/40 hover:bg-[#ff2d55] hover:text-white flex items-center gap-2"
          data-mag
        >
          <LogoutIcon size={14} animateOnHover={true} /> Terminate Session
        </button>
      </div>

      {/* 2. MAIN CONSOLE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Identity & Security Card (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Identity Card */}
          <div className="card-bento p-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#06080a] border-2 border-[#c8ff2e] flex items-center justify-center text-[#c8ff2e] shadow-[0_0_25px_rgba(200,255,46,0.25)]">
              <UserIcon size={36} animateOnHover={true} />
            </div>

            <div>
              <h2 className="font-['Syne'] font-extrabold text-2xl uppercase tracking-tight text-white">
                {user?.full_name || 'Active Operator'}
              </h2>
              <span className="chip v text-[10px] uppercase font-mono mt-2 inline-block">
                ● {(role || 'operator').toUpperCase()} LEVEL ACCESS
              </span>
            </div>

            <div className="p-3 bg-[#06080a] border border-white/5 rounded-xl font-mono text-xs text-[#b7c1ae]">
              {user?.email || (role === 'admin' ? 'admin@logistics.in' : role === 'manager' ? 'manager@logistics.in' : 'customer@client.in')}
            </div>

            {/* Quick 1-Click Role Switcher */}
            <div className="pt-2 text-left space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block">
                Instant Role Switcher (Demo Console)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSwitchRole('admin')}
                  className={`py-2 rounded-xl font-mono text-xs font-bold border transition ${
                    role === 'admin'
                      ? 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e]'
                      : 'bg-[#06080a] text-[#7f8a79] border-white/10 hover:text-white'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleSwitchRole('manager')}
                  className={`py-2 rounded-xl font-mono text-xs font-bold border transition ${
                    role === 'manager'
                      ? 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e]'
                      : 'bg-[#06080a] text-[#7f8a79] border-white/10 hover:text-white'
                  }`}
                >
                  Manager
                </button>
                <button
                  onClick={() => handleSwitchRole('customer')}
                  className={`py-2 rounded-xl font-mono text-xs font-bold border transition ${
                    role === 'customer'
                      ? 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e]'
                      : 'bg-[#06080a] text-[#7f8a79] border-white/10 hover:text-white'
                  }`}
                >
                  Customer
                </button>
              </div>
            </div>
          </div>

          {/* Security Protocols Bento */}
          <div className="card-bento p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Settings size={16} className="text-[#c8ff2e]" />
              <h3 className="font-['Syne'] font-extrabold text-sm uppercase tracking-wide">
                Security Credentials
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#06080a] border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#eef2e6]">
                  <Lock size={14} className="text-[#3ddc84]" />
                  <span>FIDO2 / Hardware 2FA</span>
                </div>
                <span className="chip ok text-[10px]">Active</span>
              </div>

              <div className="p-3 bg-[#06080a] border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#eef2e6]">
                  <Key size={14} className="text-[#c8ff2e]" />
                  <span>JWT Bearer (HS256)</span>
                </div>
                <span className="chip text-[10px]">Valid Session</span>
              </div>

              <div className="p-3 bg-[#06080a] border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#eef2e6]">
                  <ShieldCheckIcon size={14} className="text-[#00f0ff]" animateOnHover={true} />
                  <span>Bcrypt Salting (10 Rounds)</span>
                </div>
                <span className="chip text-[10px]">Verified</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Activity Audit Log (7 Columns) */}
        <div className="lg:col-span-7 card-bento p-6 flex flex-col h-[660px]">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ActivityIcon size={18} className="text-[#c8ff2e]" animateOnHover={true} />
              <h3 className="font-['Syne'] font-extrabold text-xl uppercase tracking-tight">
                Activity Audit Trail
              </h3>
            </div>
            <span className="chip ok text-xs font-mono">
              ● {activityLogs.length} Events Synced
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-xs">
            {activityLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-3.5 bg-[#06080a] border border-white/5 rounded-2xl hover:border-white/20 transition flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[10px] text-[#7f8a79]">
                  <span className="text-[#c8ff2e] font-bold">LOG #{log.id.slice(-6)}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-[#eef2e6] font-medium leading-relaxed">
                  {log.action}
                </div>
              </div>
            ))}

            {activityLogs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[#7f8a79] text-xs space-y-2">
                <CheckCircle2 size={32} className="text-[#3ddc84]" />
                <p>No anomalous activities logged. Session is pristine.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
