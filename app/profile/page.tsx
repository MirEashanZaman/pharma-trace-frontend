'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  Wallet,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  UserCog,
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { fetchProfile, updateProfile, getStoredUser, UserProfile } from '@/lib/api';
import { connectMetaMask } from '@/lib/web3';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('MANUFACTURER');
  const [walletAddress, setWalletAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const stored = getStoredUser();
        if (!stored) {
          const token = localStorage.getItem('pharma_access_token');
          if (!token) {
            router.push('/login');
            return;
          }
        }
        const profile = await fetchProfile();
        setCurrentUser(profile);
        setEmail(profile.email || '');
        setFullName(profile.fullName || '');
        setOrganization(profile.organization || '');
        setRole(profile.role || 'MANUFACTURER');
        setWalletAddress(profile.walletAddress || '');
      } catch (err: any) {
        const stored = getStoredUser();
        if (stored) {
          setCurrentUser(stored);
          setEmail(stored.email || '');
          setFullName(stored.fullName || '');
          setOrganization(stored.organization || '');
          setRole(stored.role || 'MANUFACTURER');
          setWalletAddress(stored.walletAddress || '');
        } else {
          setErrorMessage('Unable to load user profile. Please sign in again.');
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (newPassword && newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    setSaving(true);
    try {
      const payload: {
        fullName?: string;
        organization?: string;
        walletAddress?: string;
        password?: string;
      } = {
        fullName: fullName.trim(),
        organization: organization.trim(),
        walletAddress: walletAddress.trim(),
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const updated = await updateProfile(payload);
      setCurrentUser(updated);
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Profile details updated successfully.');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to update profile. Please check your inputs and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUseConnectedWallet = async () => {
    try {
      const addr = await connectMetaMask();
      if (addr) {
        setWalletAddress(addr);
        setWallet(addr);
      }
    } catch (err) {
      setErrorMessage('Failed to connect MetaMask wallet.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <Navigation
        walletAddress={wallet}
        onConnectWallet={async () => setWallet(await connectMetaMask())}
        currentUser={currentUser}
      />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#00D6B4] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Enterprise Dashboard</span>
          </Link>
          <Badge variant="teal" size="sm" className="font-mono">
            Identity & Credentials
          </Badge>
        </div>

        <Card className="border border-[#304257] bg-[#172638] shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-[#304257]/60 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#00D6B4]/15 border border-[#00D6B4]/30 flex items-center justify-center text-[#00D6B4]">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-[#F1F5F9]">
                  Edit Profile & Credentials
                </CardTitle>
                <CardDescription className="text-xs text-[#94A3B8] mt-0.5">
                  Update account details, role assignment, wallet address, and credentials. Email address is permanent and unique.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {currentUser?.warningCount ? (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-300">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Administrative Warning Active ({currentUser.warningCount} Issued)</span>
                </div>
                <div>{currentUser.warningReason || 'Account compliance review notice'}</div>
              </div>
            ) : null}

            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 rounded-xl bg-[#0B1220] border border-[#304257] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#00D6B4]" />
                    <span>Email Address</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] bg-[#172638] px-2 py-0.5 rounded border border-[#304257]">
                    <Lock className="h-3 w-3 text-[#00D6B4]" /> Unique & Immutable
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    className="w-full h-11 bg-[#172638]/70 border border-[#304257] rounded-xl px-4 text-xs font-mono text-[#94A3B8] cursor-not-allowed opacity-80 select-all"
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Your registered email address serves as your unique primary cryptographic identity and cannot be altered.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
                    <User className="h-4 w-4 text-[#00D6B4]" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-11 bg-[#0B1220] border border-[#304257] rounded-xl px-4 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#00D6B4]" />
                    <span>Organization</span>
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Enter your organization name"
                    className="w-full h-11 bg-[#0B1220] border border-[#304257] rounded-xl px-4 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#00D6B4]" />
                      <span>Supply Chain Role</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] bg-[#0B1220] px-2 py-0.5 rounded border border-[#304257]">
                      <Lock className="h-3 w-3 text-[#00D6B4]" /> Fixed Role
                    </span>
                  </div>
                  <input
                    type="text"
                    value={role}
                    disabled
                    readOnly
                    className="w-full h-11 bg-[#172638]/70 border border-[#304257] rounded-xl px-4 text-xs font-bold text-[#00D6B4] cursor-not-allowed opacity-90 select-none uppercase tracking-wider"
                  />
                  <p className="text-[11px] text-[#94A3B8]">
                    Your role is fixed upon registration and cannot be modified.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-[#00D6B4]" />
                      <span>Wallet Address</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleUseConnectedWallet}
                      className="text-[11px] text-[#00D6B4] hover:underline font-bold"
                    >
                      Connect MetaMask
                    </button>
                  </div>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address (0x...)"
                    className="w-full h-11 bg-[#0B1220] border border-[#304257] rounded-xl px-4 text-xs font-mono text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1220] border border-[#304257] space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#00D6B4]" />
                    <span>Security & Password Update</span>
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Leave password fields blank if you do not wish to change your current password.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#94A3B8] font-semibold block">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        minLength={6}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password (min. 6 characters)"
                        className="w-full h-11 bg-[#172638] border border-[#304257] rounded-xl pl-4 pr-10 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00D6B4] p-1 rounded-md"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#94A3B8] font-semibold block">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        minLength={6}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Enter your password confirmation"
                        className="w-full h-11 bg-[#172638] border border-[#304257] rounded-xl pl-4 pr-10 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00D6B4] p-1 rounded-md"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#304257]/60">
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="rounded-xl px-5 border-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#243247]"
                >
                  <Link href="/dashboard">Cancel</Link>
                </Button>

                <Button
                  type="submit"
                  disabled={saving || loading}
                  className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold rounded-xl px-6 flex items-center gap-2 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

