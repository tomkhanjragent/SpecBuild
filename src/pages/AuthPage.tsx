import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Network, Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export function AuthPage() {
  const { user, needsSetup, login, setupAdmin, isLoading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to home
  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Email and password required');
      return;
    }

    if (needsSetup && password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      if (needsSetup) {
        await setupAdmin({ email: email.trim(), password });
        toast.success('Admin account created! Welcome to TeamTree.');
      } else {
        await login({ email: email.trim(), password });
        toast.success('Signed in successfully');
      }
    } catch (err: any) {
      toast.error(err.message || (needsSetup ? 'Setup failed' : 'Sign in failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl p-7 shadow-2xl backdrop-blur-md">
          {/* Brand header */}
          <div className="text-center pb-6 border-b border-slate-700/50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mb-3 shadow-inner">
              <Network className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold font-display tracking-tight text-white">
              TeamTree
            </h1>

            {needsSetup ? (
              <div className="mt-2 space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[11px] font-medium text-blue-300">
                  <ShieldAlert className="w-3 h-3 text-blue-400" />
                  Initial Setup
                </span>
                <p className="text-xs font-medium text-slate-300 font-bengali">
                  প্রথমবার সেটআপ — Create the admin account
                </p>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-400 font-bengali">
                Private platform · শুধুমাত্র অনুমতিপ্রাপ্তদের জন্য
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder={needsSetup ? 'Min 8 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={needsSetup ? 'Must be at least 8 characters' : undefined}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {needsSetup ? 'Create admin & sign in' : 'Sign in'}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Private multi-level agent & host management platform
        </p>
      </div>
    </div>
  );
}
