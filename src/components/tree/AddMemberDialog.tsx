import React, { useState, useEffect } from 'react';
import { Member, AppRow, Field } from '../../types/app.types';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CustomFieldsEditor } from '../profile/CustomFieldsEditor';
import { useToast } from '../ui/Toast';
import { createMember } from '../../lib/team-data';

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppRow | null;
  parentMember: Member | null;
  customFields: Field[];
  onMemberCreated: (newMember: Member) => void;
}

export function AddMemberDialog({
  isOpen,
  onClose,
  app,
  parentMember,
  customFields,
  onMemberCreated,
}: AddMemberDialogProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [appUserId, setAppUserId] = useState('');
  const [status, setStatus] = useState<'active' | 'no_work'>('active');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setWhatsapp('');
      setAppUserId('');
      setStatus('active');
      setCustomValues({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;

    if (!name.trim()) {
      toast.error('Member name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createMember({
        app_id: app.id,
        parent_id: parentMember ? parentMember.id : null,
        name: name.trim(),
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        app_user_id: appUserId.trim() || null,
        status,
        custom: customValues,
      });

      toast.success(
        parentMember
          ? `Added member under ${parentMember.name}`
          : 'Leader created successfully'
      );
      onMemberCreated(created);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLeader = !parentMember;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isLeader ? 'Add leader' : `Add member under ${parentMember?.name}`}
      description={
        isLeader
          ? `Create a top-level leader in ${app?.name || 'app'}`
          : `Create a direct child member under ${parentMember?.name} in ${app?.name || 'app'}`
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <Input
          label="Full Name *"
          placeholder="e.g. Maha, Faria, Karim"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="App ID (External ID)"
            placeholder="e.g. MK-1025"
            value={appUserId}
            onChange={(e) => setAppUserId(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'no_work')}
              className="w-full bg-[#131E31] text-slate-100 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700/60 focus:outline-none focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="no_work">No Work (Inactive)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone"
            placeholder="+8801XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="WhatsApp Number"
            placeholder="8801XXXXXXXXX"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        {/* Custom fields */}
        {customFields.length > 0 && (
          <div className="pt-2">
            <CustomFieldsEditor
              fields={customFields}
              values={customValues}
              onChange={(fieldId, val) =>
                setCustomValues((prev) => ({ ...prev, [fieldId]: val }))
              }
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/50">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            {isLeader ? 'Add leader' : 'Add member'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
