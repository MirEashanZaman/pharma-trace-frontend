'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, web3LoginUser } from '@/lib/api';
import { connectMetaMask, signAttestationMessage } from '@/lib/web3';
import { ShieldCheck, Lock, Mail, KeyRound, Wallet, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('MANUFACTURER');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser({
          email,
          password,
          fullName,
          role,
          organization,
        });
      } else {
        await loginUser({ email, password });
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWeb3Login = async () => {
    setError('');
    setLoading(true);
    try {
      const address = await connectMetaMask();
      if (!address) {
        setLoading(false);
        return;
      }

      const timestamp = new Date().toISOString();
      const message = `Sign this message to authenticate with PharmaTrace-ES Web3:\nWallet: ${address}\nTimestamp: ${timestamp}`;

      const signResult = await signAttestationMessage(message);
      if (!signResult) {
        setError('Signature rejected.');
        setLoading(false);
        return;
      }

      await web3LoginUser({
        walletAddress: address,
        signature: signResult.signature,
        message,
        role,
        organization: organization || 'Web3 Verified Participant',
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Web3 login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-7 w-7 text-slate-950" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {isRegister ? 'Create PharmaTrace Account' : 'Sign in to PharmaTrace-ES'}
          </h2>
          <p className="text-xs text-slate-400">
            Access Event Sourcing, Saga validations, and Web3 smart contract attestations.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium">
            {error}
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 shadow-2xl space-y-5">
          {/* Web3 Wallet Sign-In Button */}
          <button
            type="button"
            onClick={handleWeb3Login}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Wallet className="h-4 w-4" /> Sign In with Web3 Wallet (MetaMask)
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Or email password
            </span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <UserCheck className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pharma-corp.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <KeyRound className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Supply Chain Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="MANUFACTURER">MANUFACTURER</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                    <option value="PHARMACY">PHARMACY</option>
                    <option value="REGULATOR">REGULATOR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Organization</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Novartis"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs tracking-wider transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Register Now
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
