import React, { useState } from 'react';
import { TreeNode, Member } from '../../types/app.types';
import { ChevronRight, ChevronDown, UserPlus } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { NoWorkFolder } from './NoWorkFolder';

interface MemberNodeProps {
  node: TreeNode;
  selectedMemberId: string | null;
  onSelectMember: (member: Member) => void;
  onAddChild: (parentMember: Member) => void;
  onReactivate?: (member: Member) => void;
  depth?: number;
}

export function MemberNode({
  node,
  selectedMemberId,
  onSelectMember,
  onAddChild,
  onReactivate,
  depth = 0,
}: MemberNodeProps) {
  // Open by default if it has active children or if top-level
  const [isOpen, setIsOpen] = useState(true);

  const hasChildren = node.children.length > 0;
  const hasNoWork = node.noWork.length > 0;
  const hasSubTree = hasChildren || hasNoWork;
  const isSelected = selectedMemberId === node.member.id;

  const directActiveCount = node.children.length;

  return (
    <div className="relative select-none">
      {/* Node Row */}
      <div
        className={`group flex items-center justify-between py-2 px-3 rounded-2xl transition-all cursor-pointer border ${
          isSelected
            ? 'bg-blue-600/15 border-blue-500/50 shadow-xs'
            : 'hover:bg-slate-800/60 border-transparent hover:border-slate-800'
        }`}
        onClick={() => onSelectMember(node.member)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Expand/Collapse Chevron */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={`p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
              !hasSubTree ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Avatar with status dot */}
          <Avatar
            name={node.member.name}
            photoPath={node.member.photo_path}
            status={node.member.status}
            showStatus
            size="md"
          />

          {/* Member Name & ID */}
          <div className="min-w-0 flex items-baseline gap-2">
            <span
              className={`font-semibold text-sm truncate font-display ${
                isSelected ? 'text-white' : 'text-slate-100 group-hover:text-white'
              }`}
            >
              {node.member.name}
            </span>

            {/* Direct active count: (12) */}
            <span className="text-xs font-mono text-blue-400/90 font-medium">
              ({directActiveCount})
            </span>

            {node.member.app_user_id && (
              <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
                {node.member.app_user_id}
              </span>
            )}
          </div>
        </div>

        {/* Hover quick action: Add child */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.member);
            }}
            title="Add member under this node"
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-300 hover:bg-blue-500/15 rounded-xl border border-transparent hover:border-blue-500/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Children & No Work branch */}
      {hasSubTree && isOpen && (
        <div className="ml-5 pl-4 border-l border-slate-800 space-y-1 mt-1">
          {/* Active direct children */}
          {node.children.map((childNode) => (
            <MemberNode
              key={childNode.member.id}
              node={childNode}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
              onAddChild={onAddChild}
              onReactivate={onReactivate}
              depth={depth + 1}
            />
          ))}

          {/* Direct parent's No Work folder (only its own inactive children!) */}
          {hasNoWork && (
            <NoWorkFolder
              nodes={node.noWork}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
              onReactivate={onReactivate}
            />
          )}
        </div>
      )}
    </div>
  );
}
