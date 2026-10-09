import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppRow, Member, Field } from '../types/app.types';
import {
  fetchApps,
  fetchMembers,
  fetchCustomFields,
  updateMember,
  deleteMember,
} from '../lib/team-data';
import { MemberTree } from '../components/tree/MemberTree';
import { ProfilePanel } from '../components/profile/ProfilePanel';
import { AddMemberDialog } from '../components/tree/AddMemberDialog';
import { Button } from '../components/ui/Button';
import { Plus, UserPlus, Layers, RefreshCw } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [apps, setApps] = useState<AppRow[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  const [customFields, setCustomFields] = useState<Field[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Add Member Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [parentForNewMember, setParentForNewMember] = useState<Member | null>(null);

  // Load apps & custom fields initially
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setIsAppsLoading: setIsLoadingApps(true);
        const [appList, fieldsList] = await Promise.all([
          fetchApps(),
          fetchCustomFields(),
        ]);

        if (!isMounted) return;
        setApps(appList);
        setCustomFields(fieldsList);

        // Determine active app from URL or default to first
        const paramAppId = searchParams.get('app');
        if (paramAppId && appList.some((a) => a.id === paramAppId)) {
          setSelectedAppId(paramAppId);
        } else if (appList.length > 0) {
          setSelectedAppId(appList[0].id);
          setSearchParams({ app: appList[0].id }, { replace: true });
        }
      } catch (err) {
        console.error('Failed to init dashboard:', err);
      } finally {
        if (isMounted) setIsLoadingApps(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // When selected app changes, fetch its members
  useEffect(() => {
    if (!selectedAppId) return;

    let isMounted = true;
    async function loadMembers() {
      try {
        setIsLoadingMembers(true);
        setSelectedMember(null);
        const memberList = await fetchMembers(selectedAppId);
        if (isMounted) {
          setMembers(memberList);
        }
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        if (isMounted) setIsLoadingMembers(false);
      }
    }

    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [selectedAppId]);

  // Handle Tab switch
  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    setSearchParams({ app: appId });
  };

  const currentApp = useMemo(() => {
    return apps.find((a) => a.id === selectedAppId) || null;
  }, [apps, selectedAppId]);

  // Member update handler
  const handleUpdateMember = async (id: string, updates: Partial<Member>) => {
    const updated = await updateMember(id, updates);
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember((prev) => (prev ? { ...prev, ...updated } : null));
    }
  };

  // Member delete handler
  const handleDeleteMember = async (id: string) => {
    await deleteMember(id);
    // Remove deleted member and their recursive children from state
    const memberList = await fetchMembers(selectedAppId);
    setMembers(memberList);
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember(null);
    }
  };

  // Add child under existing member
  const handleAddChild = (parentMember: Member) => {
    setParentForNewMember(parentMember);
    setIsAddDialogOpen(true);
  };

  // Add top-level leader
  const handleAddLeader = () => {
    setParentForNewMember(null);
    setIsAddDialogOpen(true);
  };

  // Reactivate a member from No Work folder
  const handleReactivate = async (member: Member) => {
    try {
      await handleUpdateMember(member.id, { status: 'active' });
      toast.success(`${member.name} marked as Active`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reactivate member');
    }
  };

  // After new member created
  const handleMemberCreated = (newMember: Member) => {
    setMembers((prev) => [...prev, newMember]);
    setSelectedMember(newMember);
  };

  const activeCount = members.filter((m) => m.status === 'active').length;
  const noWorkCount = members.filter((m) => m.status === 'no_work').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Bar: App Tabs + Add Leader Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        {/* App selector tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {apps.map((app) => {
            const isActive = app.id === selectedAppId;
            return (
              <button
                key={app.id}
                onClick={() => handleSelectApp(app.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-500/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {app.name}
              </button>
            );
          })}
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {activeCount} Active
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {noWorkCount} No Work
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleAddLeader}
            icon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Add leader
          </Button>
        </div>
      </div>

      {/* Main Content Area: Tree on Left, Profile Panel on Right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start min-h-[500px]">
        {/* Left Side: Member Hierarchy Tree */}
        <div
          className={`w-full transition-all duration-200 ${
            selectedMember ? 'lg:flex-1' : 'w-full'
          }`}
        >
          <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-display">
                  {currentApp?.name || 'Workspace'} Hierarchy Tree
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  ({members.length} members)
                </span>
              </div>
            </div>

            {isLoadingMembers ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-800/50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <MemberTree
                members={members}
                selectedMemberId={selectedMember?.id || null}
                onSelectMember={(m) => setSelectedMember(m)}
                onAddChild={handleAddChild}
                onAddLeader={handleAddLeader}
                onReactivate={handleReactivate}
              />
            )}
          </div>
        </div>

        {/* Right Side: Profile Panel (appears when a member is selected) */}
        {selectedMember && (
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-20">
            <ProfilePanel
              member={selectedMember}
              app={currentApp}
              allMembers={members}
              customFields={customFields}
              onClose={() => setSelectedMember(null)}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onAddChild={handleAddChild}
            />
          </div>
        )}
      </div>

      {/* Add Member / Leader Modal */}
      <AddMemberDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        app={currentApp}
        parentMember={parentForNewMember}
        customFields={customFields}
        onMemberCreated={handleMemberCreated}
      />
    </div>
  );
}
