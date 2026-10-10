'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, web3LoginUser } from '@/lib/api';
import { connectMetaMask, signAttestationMessage } from '@/lib/web3';
import { ShieldCheck, Mail, KeyRound, Wallet, ArrowRight, UserCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F4F8FB] text-[#102A43] flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#16B8A6] items-center justify-center text-white shadow-md">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#102A43]">
            {isRegister ? 'Create PharmaTrace Account' : 'Sign in to PharmaTrace-ES'}
          </h2>
          <p className="text-xs text-[#52677A]">
            Access Event Sourcing, Saga validations, and Web3 smart contract attestations.
          </p>
        </div>

        {error && (
          <div className="alert alert-error text-xs rounded-xl shadow-sm text-white">
            {error}
          </div>
        )}

        <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <button
            type="button"
            onClick={handleWeb3Login}
            disabled={loading}
            className="btn bg-[#102A43] hover:bg-[#0c2135] text-white border-none w-full py-3 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm"
          >
            <Wallet className="h-4 w-4 text-[#16B8A6]" /> Sign In with Web3 Wallet (MetaMask)
          </button>

          <div className="divider text-[11px] uppercase tracking-wider text-[#52677A] font-bold">
            Or email password
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs text-[#52677A] font-semibold block mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="input input-bordered w-full bg-white border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-[#102A43] focus:border-[#16B8A6]"
                  />
                  <UserCheck className="h-4 w-4 text-[#52677A] absolute left-3.5 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-[#52677A] font-semibold block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pharma-corp.com"
                  className="input input-bordered w-full bg-white border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-[#102A43] focus:border-[#16B8A6]"
                />
                <Mail className="h-4 w-4 text-[#52677A] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#52677A] font-semibold block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input input-bordered w-full bg-white border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-[#102A43] focus:border-[#16B8A6]"
                />
                <KeyRound className="h-4 w-4 text-[#52677A] absolute left-3.5 top-3" />
              </div>
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#52677A] font-semibold block mb-1">Supply Chain Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="select select-bordered w-full bg-white border-slate-300 rounded-xl text-xs text-[#102A43]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANUFACTURER">MANUFACTURER</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                    <option value="PHARMACY">PHARMACY</option>
                    <option value="REGULATOR">REGULATOR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#52677A] font-semibold block mb-1">Organization</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Novartis"
                    className="input input-bordered w-full bg-white border-slate-300 rounded-xl px-3 py-2 text-xs text-[#102A43]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn bg-[#16B8A6] hover:bg-[#139485] text-white border-none w-full py-3 rounded-xl font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
            >
              {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#52677A] pt-2 border-t border-slate-200">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-[#16B8A6] font-bold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-[#16B8A6] font-bold hover:underline"
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
