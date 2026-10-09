import React, { useState, useEffect } from 'react';
import {
  Member,
  AppRow,
  Field,
  MemberStatus,
} from '../../types/app.types';
import {
  X,
  Phone,
  MessageCircle,
  Calendar,
  Layers,
  ArrowRightLeft,
  UserPlus,
  Trash2,
  Check,
  ExternalLink,
  Edit2,
  Save,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog } from '../ui/Dialog';
import { PhotoUploader } from './PhotoUploader';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { canMoveMember } from '../../lib/tree';
import { useToast } from '../ui/Toast';

interface ProfilePanelProps {
  member: Member | null;
  app: AppRow | null;
  allMembers: Member[];
  customFields: Field[];
  onClose: () => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onAddChild: (parentMember: Member) => void;
}

export function ProfilePanel({
  member,
  app,
  allMembers,
  customFields,
  onClose,
  onUpdateMember,
  onDeleteMember,
  onAddChild,
}: ProfilePanelProps) {
  const toast = useToast();

  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [appUserId, setAppUserId] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Move Modal State
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [targetParentId, setTargetParentId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  // Delete Confirm Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setPhone(member.phone || '');
      setWhatsapp(member.whatsapp || '');
      setAppUserId(member.app_user_id || '');
      setCustomValues(member.custom || {});
      setIsEditingBasic(false);
    }
  }, [member]);

  if (!member) return null;

  // Format joined date: "07 Oct 2026, 21:04"
  const formattedJoinedDate = (() => {
    try {
      const d = new Date(member.joined_at);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
    } catch {
      return member.joined_at;
    }
  })();

  // WhatsApp link format: https://wa.me/<digits>
  const waDigits = (whatsapp || '').replace(/\D/g, '');
  const waLink = waDigits ? `https://wa.me/${waDigits}` : null;

  // Status toggle handler
  const handleToggleStatus = async () => {
    const newStatus: MemberStatus = member.status === 'active' ? 'no_work' : 'active';
    try {
      setIsSaving(true);
      await onUpdateMember(member.id, { status: newStatus });
      toast.success(
        newStatus === 'active'
          ? 'Member marked as Active'
          : 'Member moved to direct parent\'s No Work folder'
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to change status');
    } finally {
      setIsSaving(false);
    }
  };

  // Save basic fields (name, phone, whatsapp, app_user_id)
  const handleSaveBasic = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    try {
      setIsSaving(true);
      await onUpdateMember(member.id, {
        name: name.trim(),
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        app_user_id: appUserId.trim() || null,
      });
      setIsEditingBasic(false);
      toast.success('Profile details updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update details');
    } finally {
      setIsSaving(false);
    }
  };

  // Custom field update handler with debounce/blur
  const handleCustomFieldChange = (fieldId: string, val: string) => {
    const updated = { ...customValues, [fieldId]: val };
    setCustomValues(updated);
    // Persist custom values to member
    onUpdateMember(member.id, { custom: updated }).catch((err) => {
      console.error('Failed to update custom field:', err);
    });
  };

  // Photo uploaded
  const handlePhotoUploaded = async (path: string, url: string) => {
    await onUpdateMember(member.id, { photo_path: path });
  };

  // Move parent handler
  const handleMoveMember = async () => {
    const newParent = targetParentId === '__ROOT__' ? null : targetParentId;
    if (!canMoveMember(allMembers, member.id, newParent)) {
      toast.error('Cannot move under this parent (cycle or invalid target)');
      return;
    }

    try {
      setIsMoving(true);
      await onUpdateMember(member.id, { parent_id: newParent });
      setIsMoveOpen(false);
      toast.success('Member moved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to move member');
    } finally {
      setIsMoving(false);
    }
  };

  // Delete member handler
  const handleDeleteMember = async () => {
    try {
      setIsDeleting(true);
      await onDeleteMember(member.id);
      setIsDeleteOpen(false);
      onClose();
      toast.success('Member and sub-branch deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete member');
    } finally {
      setIsDeleting(false);
    }
  };

  // Eligible parents for Move dialog
  const eligibleParents = allMembers.filter((m) => {
    return canMoveMember(allMembers, member.id, m.id);
  });

  const parentMember = allMembers.find((m) => m.id === member.parent_id);

  return (
    <div className="w-full lg:w-96 bg-[#1E293B] border border-slate-700/60 rounded-2xl flex flex-col h-full overflow-hidden shadow-xl animate-in slide-in-from-right-4 duration-200">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-700/60 flex items-center justify-between bg-slate-800/40">
        <div className="flex items-center gap-2">
          <Badge status={member.status} size="sm" />
          <span className="text-xs text-slate-400">
            {parentMember ? `Under: ${parentMember.name}` : 'Top Leader'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Photo & Name */}
        <div className="flex flex-col items-center text-center">
          <PhotoUploader
            memberId={member.id}
            memberName={member.name}
            photoPath={member.photo_path}
            onPhotoUploaded={handlePhotoUploaded}
          />

          {!isEditingBasic ? (
            <div className="mt-3 flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100 font-display">
                {member.name}
              </h3>
              <button
                onClick={() => setIsEditingBasic(true)}
                className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                title="Edit basic info"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="mt-3 w-full space-y-2">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* App Info Box */}
          <div className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">App:</span>
              <span className="font-semibold text-blue-400">{app?.name || 'Workspace'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Joined:</span>
              <span className="text-slate-300">{formattedJoinedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">App ID:</span>
              {!isEditingBasic ? (
                <span className="font-mono text-slate-200">{member.app_user_id || '—'}</span>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. MK-1023"
                  value={appUserId}
                  onChange={(e) => setAppUserId(e.target.value)}
                  className="w-28 bg-[#131E31] px-2 py-0.5 rounded text-xs border border-slate-700 text-slate-100"
                />
              )}
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-display">
              Personal
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {!isEditingBasic ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone</span>
                </div>
                {member.phone ? (
                  <a
                    href={`tel:${member.phone}`}
                    className="text-slate-200 hover:text-blue-400 font-medium"
                  >
                    {member.phone}
                  </a>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-300">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </div>
                {waLink ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    <span>Chat now</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                label="Phone Number"
                placeholder="+8801XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-3.5 h-3.5" />}
              />
              <Input
                label="WhatsApp Number (with country code)"
                placeholder="8801XXXXXXXXX"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingBasic(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveBasic}
                  isLoading={isSaving}
                  icon={<Save className="w-3 h-3" />}
                >
                  Save Personal
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Fields (Payment, Work, etc.) */}
        <CustomFieldsEditor
          fields={customFields}
          values={customValues}
          onChange={handleCustomFieldChange}
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 border-t border-slate-700/60 bg-slate-900/60 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Status Toggle */}
          <Button
            size="sm"
            variant={member.status === 'active' ? 'danger' : 'secondary'}
            onClick={handleToggleStatus}
            isLoading={isSaving}
          >
            {member.status === 'active' ? 'Set No Work' : 'Set Active'}
          </Button>

          {/* Move Member */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setTargetParentId(member.parent_id || '__ROOT__');
              setIsMoveOpen(true);
            }}
            icon={<ArrowRightLeft className="w-3 h-3" />}
          >
            Move
          </Button>
        </div>

        {/* Add Member Under */}
        <Button
          size="sm"
          className="w-full"
          onClick={() => onAddChild(member)}
          icon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Add member under
        </Button>

        {/* Delete Member */}
        <Button
          size="sm"
          variant="ghost"
          className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          onClick={() => setIsDeleteOpen(true)}
          icon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete member
        </Button>
      </div>

      {/* Move Parent Modal */}
      <Dialog
        isOpen={isMoveOpen}
        onClose={() => setIsMoveOpen(false)}
        title={`Move ${member.name}`}
        description="Select a new parent for this member within the same app. Cycles are prohibited."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              New Parent Node
            </label>
            <select
              value={targetParentId}
              onChange={(e) => setTargetParentId(e.target.value)}
              className="w-full bg-[#131E31] text-slate-100 text-sm rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="__ROOT__">Top Level Leader (Root)</option>
              {eligibleParents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.app_user_id ? `(${p.app_user_id})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMoveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleMoveMember}
              isLoading={isMoving}
            >
              Confirm Move
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Member Confirm Modal */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Member"
        description={`Are you sure you want to delete ${member.name}? All sub-members in this branch will also be permanently deleted (cascade).`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteMember}
            isLoading={isDeleting}
          >
            Yes, Delete Member
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
