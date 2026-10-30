import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useLogistics } from '../../contexts/LogisticsContext';
import QuickDispatchModal from '../QuickDispatchModal';
import { 
  LayoutGridIcon, 
  MapPinIcon, 
  BoxesIcon, 
  TruckIcon, 
  UsersIcon, 
  ChartLineIcon, 
  DatabaseIcon, 
  UserIcon, 
  SendIcon, 
  LogoutIcon 
} from 'lucide-animated';

export default function AppLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const location = useLocation();
  const { logout, role, user } = useLogistics();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsWiping(true));
    const timer = setTimeout(() => setIsWiping(false), 750);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', Icon: LayoutGridIcon, code: '01' },
    { name: 'Warehouses & Map', path: '/map', Icon: MapPinIcon, code: '02' },
    { name: 'Inventory', path: '/inventory', Icon: BoxesIcon, code: '03' },
    { name: 'Shipments & Dijkstra', path: '/orders', Icon: TruckIcon, code: '04' },
    { name: 'Fleet & Drivers', path: '/fleet', Icon: UsersIcon, code: '05' },
    { name: 'Analytics', path: '/analytics', Icon: ChartLineIcon, code: '06' },
    { name: 'Database Live View', path: '/database-view', Icon: DatabaseIcon, code: '07' },
    { name: 'User Profile', path: '/profile', Icon: UserIcon, code: '08' },
  ];

  return (
    <div className="min-h-screen bg-[#06080a] text-[#eef2e6] flex flex-col md:flex-row relative selection:bg-[#c8ff2e] selection:text-[#06080a]">
      <div id="wipe" className={isWiping ? 'go' : ''} />

      {/* FLOATING HOVER-EXPANDABLE DESKTOP SIDEBAR WITH ANIMATED ICONS */}
      <aside 
        className="group/sidebar fixed left-4 top-4 bottom-4 z-40 hidden md:flex flex-col justify-between w-[78px] hover:w-72 bg-[#0d1114]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(200,255,46,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#c8ff2e]/30 overflow-hidden"
      >
        {/* Top Section: Logo & Nav items */}
        <div className="flex flex-col min-w-0">
          
          {/* Brand Logo Header */}
          <div className="pb-4 mb-3 border-b border-white/10 flex items-center min-w-0 overflow-hidden">
            <NavLink to="/dashboard" className="logo flex items-center gap-3 shrink-0">
              <s className="shrink-0" />
              <span className="font-extrabold text-sm font-oxanium tracking-[0.14em] uppercase whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-75">
                LOGISTICS<span className="text-[#c8ff2e]">//</span>PRO
              </span>
            </NavLink>
          </div>

          {/* Navigation Links with Open-Source Animated Icons */}
          <nav className="space-y-1.5 flex flex-col">
            {navLinks.map((link) => {
              const { Icon } = link;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `group/link flex items-center gap-3 p-1 rounded-2xl transition-all duration-200 min-w-0 ${
                      isActive
                        ? 'text-[#c8ff2e] font-bold'
                        : 'text-[#7f8a79] hover:text-[#eef2e6]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Circular Border Ring Icon with Animated Icon */}
                      <div 
                        className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isActive
                            ? 'border-[#c8ff2e] bg-[#c8ff2e] text-[#06080a] shadow-[0_0_20px_rgba(200,255,46,0.6)]'
                            : 'border-white/15 bg-[#06080a] text-[#b7c1ae] group-hover/link:border-[#c8ff2e]/50 group-hover/link:text-white group-hover/link:bg-white/[0.04]'
                        }`}
                      >
                        <Icon size={18} animateOnHover={true} />
                      </div>

                      {/* Expandable Label in Oxanium High-Tech Font */}
                      <span 
                        className={`font-oxanium text-xs font-bold uppercase tracking-[0.12em] whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 -translate-x-3 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-75 truncate flex items-center gap-2 ${
                          isActive ? 'text-white' : 'text-[#7f8a79] group-hover/link:text-white'
                        }`}
                      >
                        <span className={`font-mono text-[9px] ${isActive ? 'text-[#c8ff2e]' : 'text-white/30 group-hover/link:text-[#c8ff2e]'}`}>
                          {link.code}
                        </span>
                        {link.name}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Dispatch Button, Operator Badge, and Logout */}
        <div className="pt-3 border-t border-white/10 space-y-2.5 flex flex-col min-w-0">
          
          {/* Quick Dispatch Action with Animated SendIcon */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center gap-3 p-1 rounded-2xl group/btn transition-all duration-200"
            title="Create New Dispatch"
            data-mag
          >
            <div className="w-11 h-11 rounded-full bg-[#c8ff2e] text-[#06080a] font-extrabold flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(200,255,46,0.4)] group-hover/btn:scale-105 transition-transform">
              <SendIcon size={16} animateOnHover={true} />
            </div>
            <span className="font-oxanium font-extrabold text-xs text-[#c8ff2e] whitespace-nowrap uppercase tracking-[0.14em] opacity-0 group-hover/sidebar:opacity-100 -translate-x-3 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-75 truncate">
              + New Dispatch
            </span>
          </button>

          {/* Operator Status Pill */}
          <div className="p-1 rounded-2xl flex items-center gap-3 bg-[#06080a]/50 border border-white/5 overflow-hidden">
            <div className="w-11 h-11 rounded-full border border-white/10 bg-[#0d1114] flex items-center justify-center shrink-0 relative">
              <span className="w-2 h-2 rounded-full bg-[#3ddc84] animate-pulse" />
            </div>
            <div className="min-w-0 opacity-0 group-hover/sidebar:opacity-100 -translate-x-3 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-75">
              <div className="font-oxanium font-bold text-xs uppercase tracking-wider text-[#eef2e6] truncate">
                {user?.full_name || user?.username || 'Operations Lead'}
              </div>
              <div className="font-mono text-[9px] text-[#3ddc84] uppercase tracking-wider truncate">
                {role || 'demo'} · MySQL+Mongo
              </div>
            </div>
          </div>

          {/* Logout Action with Animated LogoutIcon */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-1 rounded-2xl group/out transition-all duration-200"
            title="Sign Out Session"
          >
            <div className="w-11 h-11 rounded-full border border-white/10 bg-[#06080a] text-[#7f8a79] group-hover/out:text-[#ff2d55] group-hover/out:border-[#ff2d55]/40 flex items-center justify-center shrink-0 transition-colors">
              <LogoutIcon size={16} animateOnHover={true} />
            </div>
            <span className="font-oxanium text-xs font-bold uppercase tracking-[0.12em] text-[#7f8a79] group-hover/out:text-[#ff2d55] whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 -translate-x-3 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-75 truncate">
              Sign Out Session
            </span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <header className="md:hidden sticky top-0 z-40 bg-[#06080a]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <NavLink to="/dashboard" className="logo">
          <s />
          <span className="font-extrabold text-sm font-['Syne']">LOGISTICS//PRO</span>
        </NavLink>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-volt primary sm text-xs"
        >
          + Dispatch
        </button>
      </header>

      {/* MAIN VIEWPORT WITH LEFT PADDING FOR FLOATING SIDEBAR ON DESKTOP */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 md:pl-28 lg:pl-32 overflow-y-auto pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#06080a]/95 backdrop-blur-xl border-t border-white/10 py-2 px-3 flex justify-around items-center">
        {navLinks.slice(0, 5).map((link) => {
          const { Icon } = link;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 p-1 text-[10px] ${
                  isActive ? 'text-[#c8ff2e] font-bold' : 'text-[#7f8a79]'
                }`
              }
            >
              <Icon size={18} animateOnHover={true} />
              <span className="font-oxanium uppercase font-bold tracking-wider truncate max-w-[56px] text-center">{link.name.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* DISPATCH MODAL */}
      <QuickDispatchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
