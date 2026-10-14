'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, web3LoginUser } from '@/lib/api';
import { connectMetaMask, signAttestationMessage } from '@/lib/web3';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Wallet,
  ArrowRight,
  UserCheck,
  Building2,
  Truck,
  Store,
  FileCheck2,
  Lock,
  Search,
  User,
} from 'lucide-react';

interface StakeholderPersona {
  role: string;
  name: string;
  org: string;
  email: string;
  icon: any;
  color: string;
  badge: string;
  desc: string;
}

const DEMO_PERSONAS: StakeholderPersona[] = [
  {
    role: 'MANUFACTURER',
    name: 'Novartis Production Lead',
    org: 'Novartis Global',
    email: 'manufacturer@pharma.com',
    icon: Building2,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300',
    desc: 'Register drug batches, release serials, initiate custody pipeline',
  },
  {
    role: 'DISTRIBUTOR',
    name: 'DHL Cold-Chain Fleet',
    org: 'DHL Healthcare Logistics',
    email: 'distributor@pharma.com',
    icon: Truck,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300',
    desc: 'Receive consignments, monitor IoT reefer telemetry, dispatch to pharmacy',
  },
  {
    role: 'PHARMACY',
    name: 'CVS Central Hospital',
    org: 'CVS Health Care',
    email: 'pharmacy@pharma.com',
    icon: Store,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300',
    desc: 'Inbound inspection, 2-of-2 multi-sig narcotics prescription dispensing',
  },
  {
    role: 'REGULATOR',
    name: 'FDA Drug Inspector',
    org: 'Food and Drug Administration',
    email: 'regulator@pharma.com',
    icon: FileCheck2,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300',
    desc: 'Audit batches, certify Quality Checks, audit smart contract Merkle roots',
  },
  {
    role: 'ADMIN',
    name: 'System Administrator',
    org: 'PharmaTrace Governance',
    email: 'admin@pharma.com',
    icon: Lock,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300',
    desc: 'Full RBAC superuser, system health monitoring, ledger anchoring',
  },
  {
    role: 'CUSTOMER',
    name: 'John Patient',
    org: 'Public Consumer / Patient',
    email: 'customer@pharma.com',
    icon: User,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    badge: 'bg-teal-500/20 text-teal-300',
    desc: 'View personal medicine certificates and authenticity records',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('ADMIN');
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
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaLogin = async (persona: StakeholderPersona) => {
    setError('');
    setLoading(true);
    try {
      await loginUser({
        email: persona.email,
        password: '123456',
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(`Login failed for ${persona.email}. Ensure backend is running.`);
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
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#00D6B4] items-center justify-center text-[#0B1220] shadow-md font-bold">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-[#F1F5F9]">
            {isRegister ? 'Register Enterprise Facility' : 'Enterprise Supply Chain Sign In'}
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-lg mx-auto">
            PharmaTrace-ES enforces strict role-based access control (RBAC). Only certified pharmaceutical stakeholders log in to record events and sign on-chain attestations.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#172638] border border-[#304257] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center shrink-0">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F1F5F9]">Are you a Patient, Doctor, or Consumer?</div>
              <div className="text-[11px] text-[#94A3B8]">
                You do NOT need to sign in to verify medicine authenticity, batch expiry, or cold-chain storage.
              </div>
            </div>
          </div>
          <Link
            href="/verify"
            className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs shrink-0"
          >
            Go to Public Verification &rarr;
          </Link>
        </div>

        {error && (
          <div className="alert alert-error text-xs rounded-xl shadow-sm text-[#0B1220] bg-[#F87171] border-none font-bold">
            {error}
          </div>
        )}

        {!isRegister && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                Select Your Stakeholder Persona (1-Click Enterprise Access)
              </span>
              <span className="text-[11px] text-[#00D6B4] font-mono">Demo Accounts Ready</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEMO_PERSONAS.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handlePersonaLogin(p)}
                    disabled={loading}
                    className={`text-left p-4 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between ${p.color} hover:bg-slate-800/40`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`badge badge-xs font-black uppercase tracking-wider py-2 px-2 border-none ${p.badge}`}>
                          {p.role}
                        </span>
                        <IconComponent className="h-5 w-5 opacity-80" />
                      </div>
                      <h4 className="text-sm font-bold text-[#F1F5F9]">{p.name}</h4>
                      <p className="text-[11px] text-[#94A3B8] mb-2">{p.org}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] font-bold text-[#00D6B4]">
                      <span>Sign in as {p.role}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="card bg-[#243247] border border-[#304257] rounded-2xl p-6 shadow-sm space-y-5 max-w-md mx-auto w-full">
          <div className="text-center">
            <h3 className="text-sm font-bold text-[#F1F5F9]">
              {isRegister ? 'Register Custom Organization' : 'Or Custom Credentials Login'}
            </h3>
            <p className="text-[11px] text-[#94A3B8]">
              {isRegister ? 'Create an authorized supply chain account' : 'Sign in with your email or Web3 wallet'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Bell"
                    className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                  />
                  <UserCheck className="h-4 w-4 text-[#94A3B8] absolute left-3.5 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pharma.com"
                  className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                />
                <Mail className="h-4 w-4 text-[#94A3B8] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                />
                <KeyRound className="h-4 w-4 text-[#94A3B8] absolute left-3.5 top-3" />
              </div>
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Supply Chain Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                  >
                    <option value="MANUFACTURER">MANUFACTURER</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                    <option value="PHARMACY">PHARMACY</option>
                    <option value="REGULATOR">REGULATOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Organization</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Roche Labs"
                    className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none w-full py-3 rounded-xl font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
            >
              {loading ? 'Processing...' : isRegister ? 'Register Facility' : 'Sign In With Email'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="divider text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold before:bg-[#304257] after:bg-[#304257]">
            Or Authenticate with Web3
          </div>

          <button
            type="button"
            onClick={handleWeb3Login}
            disabled={loading}
            className="btn btn-outline border-[#304257] hover:bg-[#172638] hover:border-[#00D6B4] text-[#F1F5F9] w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
          >
            <Wallet className="h-4 w-4 text-[#00D6B4]" /> Connect MetaMask Signature
          </button>

          <div className="text-center text-xs text-[#94A3B8] pt-2 border-t border-[#304257]">
            {isRegister ? (
              <span>
                Already registered?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-[#00D6B4] font-bold hover:underline"
                >
                  Return to Sign In
                </button>
              </span>
            ) : (
              <span>
                New pharmaceutical participant?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-[#00D6B4] font-bold hover:underline"
                >
                  Register Organization
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
