import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Network, LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function AppHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isOverview = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isSettings = location.pathname.startsWith('/settings');

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-slate-100 hover:text-white transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold font-display tracking-tight text-white block leading-tight">
                TeamTree
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Private Host Network
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isOverview
                  ? 'bg-slate-800 text-blue-400 border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDashboard
                  ? 'bg-slate-800 text-blue-400 border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Tree View</span>
            </Link>

            {user.isAdmin && (
              <Link
                to="/settings"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSettings
                    ? 'bg-slate-800 text-blue-400 border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
                {user.email}
              </p>
            </div>
            <Badge role={user.role} size="sm">
              {user.isAdmin ? (
                <span className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  Admin
                </span>
              ) : (
                'Staff'
              )}
            </Badge>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
