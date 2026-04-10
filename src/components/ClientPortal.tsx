import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, LogOut, FileText, ArrowLeft, Settings } from 'lucide-react';

export default function ClientPortal() {
  const [token, setToken] = useState(localStorage.getItem('clientToken') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const [quotes, setQuotes] = useState<any[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [migrationDetails, setMigrationDetails] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (token) {
      fetchClientData();
    }
  }, [token]);

  const fetchClientData = async () => {
    try {
      const res = await fetch('/api/client/data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes || []);
        setClientData(data.client);
        setMigrationDetails(data.client.migrationDetails || '');
        setOrderNotes(data.client.orderNotes || '');
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/client/update-info', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ migrationDetails, orderNotes })
      });
      if (res.ok) {
        alert('Information updated successfully!');
      } else {
        alert('Failed to update information');
      }
    } catch (err) {
      alert('Error updating information');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    try {
      const res = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json() as any;
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('clientToken', data.token);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('clientToken');
    setPassword('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
        <button onClick={() => window.location.hash = ''} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Website
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(6,182,212,0.3)]">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Client Portal</h2>
          <p className="text-xs text-slate-400 text-center mb-8 font-medium">Access your quotes and requirements.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Client Email" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white focus:border-cyan-500 focus:outline-none" 
            />
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white focus:border-cyan-500 focus:outline-none" 
            />
            <button type="submit" disabled={isVerifying} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black py-4 rounded-xl text-xs tracking-widest uppercase transition-all">
              {isVerifying ? 'Verifying...' : 'Login'}
            </button>
          </form>
          {error && <p className="text-[10px] text-red-500 font-black mt-4 text-center uppercase tracking-widest">{error}</p>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Welcome, {clientData?.name || 'Client'}</h1>
              <p className="text-xs text-slate-500 font-medium">{clientData?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-cyan-500" /> Your Quotes & POs</h2>
            {quotes.length === 0 ? (
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center">
                <p className="text-slate-500 text-sm">No quotes or purchase orders have been assigned to you yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotes.map(quote => (
                  <div key={quote.id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-black text-lg">{quote.service}</h3>
                        <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Ref: {quote.id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        quote.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 
                        quote.status === 'Paid' ? 'bg-blue-500/20 text-blue-400' : 
                        quote.status === 'Revised Quote Required' ? 'bg-amber-500/20 text-amber-400' :
                        quote.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                        quote.status === 'Work in Progress' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl mb-4">
                      <p className="text-sm text-slate-400 whitespace-pre-wrap">{quote.notes || 'No additional notes provided.'}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Amount</span>
                      <span className="text-xl font-black text-white">{quote.customPrice || 'TBD'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-500" /> Project Details
              </h2>
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Migration Details (ID/Pass)</label>
                  <textarea 
                    value={migrationDetails}
                    onChange={e => setMigrationDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none h-32 resize-none"
                    placeholder="Enter admin ID and Password for migration/tenant setup..."
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Info / Notes</label>
                  <textarea 
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none h-32 resize-none"
                    placeholder="Any specific requirements or notes for your order..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-xl text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                >
                  {isUpdating ? 'Updating...' : 'Save Project Details'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
