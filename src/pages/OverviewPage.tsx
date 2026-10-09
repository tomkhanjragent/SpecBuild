import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRow, Member } from '../types/app.types';
import { fetchApps, fetchMembers } from '../lib/team-data';
import {
  Layers,
  Users,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

interface AppStats {
  app: AppRow;
  activeCount: number;
  noWorkCount: number;
  totalCount: number;
}

export function OverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [apps, setApps] = useState<AppRow[]>([]);
  const [stats, setStats] = useState<AppStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const appList = await fetchApps();
        if (!isMounted) return;
        setApps(appList);

        // Fetch member stats for each app
        const appStats = await Promise.all(
          appList.map(async (a) => {
            try {
              const members = await fetchMembers(a.id);
              const activeCount = members.filter((m) => m.status === 'active').length;
              const noWorkCount = members.filter((m) => m.status === 'no_work').length;
              return {
                app: a,
                activeCount,
                noWorkCount,
                totalCount: members.length,
              };
            } catch {
              return {
                app: a,
                activeCount: 0,
                noWorkCount: 0,
                totalCount: 0,
              };
            }
          })
        );

        if (isMounted) {
          setStats(appStats);
        }
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalActive = stats.reduce((acc, s) => acc + s.activeCount, 0);
  const totalNoWork = stats.reduce((acc, s) => acc + s.noWorkCount, 0);
  const totalMembers = totalActive + totalNoWork;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Overview Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multi-level agent and host tree management across platforms
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              Manage Apps & Staff
            </Button>
          )}
        </div>
      </div>

      {/* Global summary stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-medium text-slate-400">Total Active</span>
            <div className="text-2xl font-bold text-emerald-400 font-display mt-1">
              {isLoading ? '...' : totalActive}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-medium text-slate-400">Total No Work</span>
            <div className="text-2xl font-bold text-rose-400 font-display mt-1">
              {isLoading ? '...' : totalNoWork}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-medium text-slate-400">All Members</span>
            <div className="text-2xl font-bold text-blue-400 font-display mt-1">
              {isLoading ? '...' : totalMembers}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* App Workspace Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100 font-display">
            App Workspaces
          </h2>
          <span className="text-xs text-slate-400">
            Select an app to view and manage its member tree
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 bg-[#1E293B] border border-slate-700/40 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ app, activeCount, noWorkCount, totalCount }) => (
              <div
                key={app.id}
                onClick={() => navigate(`/dashboard?app=${app.id}`)}
                className="group bg-[#1E293B] hover:bg-[#263449] border border-slate-700/60 hover:border-blue-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors font-display">
                      {app.name}
                    </h3>
                    <div className="w-7 h-7 rounded-lg bg-slate-800/80 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Active / No Work row */}
                  <div className="mt-4 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Active:</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {activeCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>No Work:</span>
                      <span className="font-semibold text-rose-400 font-mono">
                        {noWorkCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Total Members</span>
                  <span className="font-bold text-slate-200 font-mono">
                    {totalCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
