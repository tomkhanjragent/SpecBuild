import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppRow, Field, UserRole } from '../types/app.types';
import {
  fetchApps,
  createApp,
  deleteApp,
  fetchCustomFields,
  createCustomField,
  deleteCustomField,
  updateCustomField,
  fetchStaffList,
  createStaff,
  removeStaff,
} from '../lib/team-data';
import {
  Layers,
  Sliders,
  UserCheck,
  Trash2,
  Plus,
  Shield,
  AlertTriangle,
  Mail,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { useToast } from '../components/ui/Toast';

export function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  // If not admin, access is strictly forbidden
  if (!user?.isAdmin) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-rose-400">
          Only the admin can open settings.
        </p>
      </div>
    );
  }

  // State: Apps
  const [apps, setApps] = useState<AppRow[]>([]);
  const [newAppName, setNewAppName] = useState('');
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [appToDelete, setAppToDelete] = useState<AppRow | null>(null);

  // State: Custom Fields
  const [fields, setFields] = useState<Field[]>([]);
  const [newFieldSection, setNewFieldSection] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null);

  // State: Staff
  const [staffList, setStaffList] = useState<UserRole[]>([]);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<UserRole | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [appList, fieldList, users] = await Promise.all([
        fetchApps(),
        fetchCustomFields(),
        fetchStaffList(),
      ]);
      setApps(appList);
      setFields(fieldList);
      setStaffList(users);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ================= Apps Handlers =================
  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    try {
      setIsAddingApp(true);
      const created = await createApp(newAppName.trim());
      setApps((prev) => [...prev, created]);
      setNewAppName('');
      toast.success(`App "${created.name}" created`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create app');
    } finally {
      setIsAddingApp(false);
    }
  };

  const handleConfirmDeleteApp = async () => {
    if (!appToDelete) return;
    try {
      await deleteApp(appToDelete.id);
      setApps((prev) => prev.filter((a) => a.id !== appToDelete.id));
      toast.success(`App "${appToDelete.name}" and all its members deleted`);
      setAppToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete app');
    }
  };

  // ================= Custom Fields Handlers =================
  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    try {
      setIsAddingField(true);
      const created = await createCustomField({
        section: newFieldSection.trim() || 'Other',
        label: newFieldLabel.trim(),
        field_type: 'text',
      });
      setFields((prev) => [...prev, created]);
      setNewFieldLabel('');
      toast.success(`Field "${created.label}" added`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add field');
    } finally {
      setIsAddingField(false);
    }
  };

  const handleConfirmDeleteField = async () => {
    if (!fieldToDelete) return;
    try {
      await deleteCustomField(fieldToDelete.id);
      setFields((prev) => prev.filter((f) => f.id !== fieldToDelete.id));
      toast.success(`Field "${fieldToDelete.label}" removed from profiles`);
      setFieldToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete field');
    }
  };

  // ================= Staff Handlers =================
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffPassword) {
      toast.error('Email and password required');
      return;
    }

    if (staffPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsAddingStaff(true);
      const created = await createStaff({
        email: staffEmail.trim(),
        password: staffPassword,
      });
      setStaffList((prev) => [...prev, created]);
      setStaffEmail('');
      setStaffPassword('');
      toast.success('Staff account created');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create staff account');
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleConfirmRemoveStaff = async () => {
    if (!staffToRemove) return;
    try {
      await removeStaff(staffToRemove.user_id);
      setStaffList((prev) => prev.filter((s) => s.id !== staffToRemove.id));
      toast.success(`Removed access for ${staffToRemove.email}`);
      setStaffToRemove(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove staff');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          Settings · সেটিংস
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure app workspaces, custom profile fields, and staff access credentials
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* CARD 1: Apps · অ্যাপ */}
        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Apps · অ্যাপ
              </h2>
              <p className="text-xs text-slate-400">
                Independent host platforms (e.g. Mako, Ayar, Chamet, Tigo)
              </p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              {apps.length} Apps
            </span>
          </div>

          {/* List of Apps */}
          <div className="space-y-2">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs font-display">
                    {app.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-100 font-display">
                    {app.name}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAppToDelete(app)}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>

          {/* Add App Form */}
          <form onSubmit={handleAddApp} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="App name (e.g. Poppo, Uplive)"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              className="flex-1 bg-[#131E31] text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700/60 focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              size="sm"
              isLoading={isAddingApp}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </form>
        </div>

        {/* CARD 2: Profile fields · কাস্টম ফিল্ড */}
        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Profile fields · কাস্টম ফিল্ড
              </h2>
              <p className="text-xs text-slate-400">
                Custom fields grouped by section, saved per member profile
              </p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              {fields.length} Fields
            </span>
          </div>

          {/* List of Custom Field Definitions */}
          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {field.section}
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {field.label}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFieldToDelete(field)}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>

          {/* Add Field Form */}
          <form
            onSubmit={handleAddField}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2"
          >
            <input
              type="text"
              placeholder="Section (e.g. Payment, Work)"
              value={newFieldSection}
              onChange={(e) => setNewFieldSection(e.target.value)}
              className="bg-[#131E31] text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700/60 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Field name (e.g. Bkash No, Target)"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              className="bg-[#131E31] text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700/60 focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              size="sm"
              isLoading={isAddingField}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </form>
        </div>

        {/* CARD 3: Team access · স্টাফ */}
        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Team access · স্টাফ
              </h2>
              <p className="text-xs text-slate-400">
                Only people listed here can sign in. Share the password with them privately.
              </p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              {staffList.length} Accounts
            </span>
          </div>

          {/* List of Staff Accounts */}
          <div className="space-y-2">
            {staffList.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-200">
                    {st.email}
                  </span>
                  <Badge role={st.role} size="sm" />
                </div>

                {st.user_id !== user.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStaffToRemove(st)}
                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add Staff Form */}
          <form
            onSubmit={handleAddStaff}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2"
          >
            <input
              type="email"
              placeholder="Email address"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              className="bg-[#131E31] text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700/60 focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Password (8+ chars)"
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              className="bg-[#131E31] text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-700/60 focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              size="sm"
              isLoading={isAddingStaff}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add staff
            </Button>
          </form>
        </div>
      </div>

      {/* Delete App Confirm Modal */}
      <Dialog
        isOpen={Boolean(appToDelete)}
        onClose={() => setAppToDelete(null)}
        title="Delete App"
        description={`Delete app "${appToDelete?.name}" and ALL its members? This action is irreversible.`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAppToDelete(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmDeleteApp}
          >
            Delete
          </Button>
        </div>
      </Dialog>

      {/* Delete Field Confirm Modal */}
      <Dialog
        isOpen={Boolean(fieldToDelete)}
        onClose={() => setFieldToDelete(null)}
        title="Delete Custom Field"
        description={`Remove this field from every profile? Existing values will be hidden.`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFieldToDelete(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmDeleteField}
          >
            Delete
          </Button>
        </div>
      </Dialog>

      {/* Remove Staff Confirm Modal */}
      <Dialog
        isOpen={Boolean(staffToRemove)}
        onClose={() => setStaffToRemove(null)}
        title="Remove Staff Access"
        description={`Remove this person's access? They will no longer be able to sign in.`}
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStaffToRemove(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmRemoveStaff}
          >
            Remove
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
