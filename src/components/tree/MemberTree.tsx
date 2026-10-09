import React, { useMemo, useState } from 'react';
import { Member, TreeNode } from '../../types/app.types';
import { buildTree } from '../../lib/tree';
import { MemberNode } from './MemberNode';
import { NoWorkFolder } from './NoWorkFolder';
import { Users, Search, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';

interface MemberTreeProps {
  members: Member[];
  selectedMemberId: string | null;
  onSelectMember: (member: Member) => void;
  onAddChild: (parentMember: Member) => void;
  onAddLeader: () => void;
  onReactivate?: (member: Member) => void;
}

export function MemberTree({
  members,
  selectedMemberId,
  onSelectMember,
  onAddChild,
  onAddLeader,
  onReactivate,
}: MemberTreeProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Partition root leaders into active root nodes and inactive root nodes
  const { rootNodes, rootNoWorkNodes } = useMemo(() => {
    const tree = buildTree(members);
    const activeRoots = tree.filter((t) => t.member.status === 'active');
    const noWorkRoots = tree.filter((t) => t.member.status === 'no_work');
    return { rootNodes: activeRoots, rootNoWorkNodes: noWorkRoots };
  }, [members]);

  // If search query is entered, show filtered list
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.app_user_id && m.app_user_id.toLowerCase().includes(term)) ||
        (m.phone && m.phone.includes(term))
    );
  }, [members, searchTerm]);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-200 font-display">
          No members yet
        </h4>
        <p className="mt-1 text-xs text-slate-400 max-w-sm">
          This app workspace has no agents or hosts yet. Create the first top-level leader to begin building the team hierarchy.
        </p>
        <Button
          size="sm"
          className="mt-4"
          onClick={onAddLeader}
          icon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Add leader
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search member by name, App ID, or phone..."
          className="w-full bg-[#131E31] text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-10 pr-3.5 py-2.5 border border-slate-700/60 hover:border-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filtered Search Results View */}
      {filteredMembers !== null ? (
        <div className="space-y-2">
          <div className="text-xs text-slate-400 px-1 font-medium">
            Search results ({filteredMembers.length})
          </div>
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching members found
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredMembers.map((m) => {
                const isSelected = selectedMemberId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMember(m)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/40 text-white'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold">{m.name}</span>
                      {m.app_user_id && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {m.app_user_id}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        m.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {m.status === 'active' ? 'Active' : 'No Work'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Standard Hierarchical Tree View */
        <div className="space-y-2">
          {rootNodes.map((rootNode) => (
            <MemberNode
              key={rootNode.member.id}
              node={rootNode}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
              onAddChild={onAddChild}
              onReactivate={onReactivate}
            />
          ))}

          {/* Root-level Inactive Leaders */}
          {rootNoWorkNodes.length > 0 && (
            <div className="pt-2">
              <NoWorkFolder
                nodes={rootNoWorkNodes}
                selectedMemberId={selectedMemberId}
                onSelectMember={onSelectMember}
                onReactivate={onReactivate}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
