import React, { useState } from 'react';
import { TreeNode, Member } from '../../types/app.types';
import { Folder, FolderOpen, ChevronRight, ChevronDown, RotateCcw } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface NoWorkFolderProps {
  nodes: TreeNode[];
  selectedMemberId: string | null;
  onSelectMember: (member: Member) => void;
  onReactivate?: (member: Member) => void;
}

export function NoWorkFolder({
  nodes,
  selectedMemberId,
  onSelectMember,
  onReactivate,
}: NoWorkFolderProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (nodes.length === 0) return null;

  return (
    <div className="mt-1.5 ml-6 border-l border-rose-500/20 pl-3">
      {/* Folder Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl cursor-pointer select-none text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition-all w-fit"
      >
        <div className="text-rose-400">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
        <div className="text-rose-400">
          {isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
        </div>
        <span className="text-xs font-semibold tracking-wide">
          No Work ({nodes.length})
        </span>
      </div>

      {/* Expanded List of Inactive Members */}
      {isOpen && (
        <div className="mt-1.5 ml-2 space-y-1">
          {nodes.map((n) => {
            const isSelected = selectedMemberId === n.member.id;

            return (
              <div
                key={n.member.id}
                className={`flex items-center justify-between group p-1.5 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/15 border border-rose-500/40 text-slate-100'
                    : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                }`}
                onClick={() => onSelectMember(n.member)}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar
                    name={n.member.name}
                    photoPath={n.member.photo_path}
                    status="no_work"
                    size="sm"
                    showStatus
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                        {n.member.name}
                      </span>
                      {n.member.app_user_id && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {n.member.app_user_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge status="no_work" size="sm" />
                  {onReactivate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReactivate(n.member);
                      }}
                      title="Reactivate member"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
