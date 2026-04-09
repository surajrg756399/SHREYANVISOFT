import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Settings, Users, Save, LogOut, Key, Mail, ArrowLeft, FileText, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loginStep, setLoginStep] = useState<'email' | 'auth'>('email');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('otp');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'pricing' | 'users' | 'clients' | 'quotes'>('pricing');
  const [pricing, setPricing] = useState<any>({});
  const [admins, setAdmins] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (token) {
      fetchConfig();
      fetchClientsAndQuotes();
    }
  }, [token]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPricing(data.pricing);
        setAdmins(data.admins);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClientsAndQuotes = async () => {
    try {
      const resClients = await fetch('/api/admin/clients', { headers: { 'Authorization': `Bearer ${token}` } });
      if (resClients.ok) setClients((await resClients.json()).clients || []);
      
      const resQuotes = await fetch('/api/admin/quotes', { headers: { 'Authorization': `Bearer ${token}` } });
      if (resQuotes.ok) setQuotes((await resQuotes.json()).quotes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'admin' })
      });
      const data = await res.json();
      if (data.success) {
        setLoginStep('auth');
        setAuthMethod('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    try {
      const payload = authMethod === 'password' ? { email, password } : { email, otp };
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
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
    localStorage.removeItem('adminToken');
    setLoginStep('email');
    setOtp('');
    setPassword('');
  };

  const handleSavePricing = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ pricing })
      });
      alert('Pricing updated successfully!');
    } catch (err) {
      alert('Failed to save pricing');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdmins = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ admins })
      });
      if (res.ok) {
        alert('Admins updated successfully!');
        fetchConfig();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save admins');
      }
    } catch (err) {
      alert('Failed to save admins');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClients = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ clients })
      });
      if (res.ok) {
        alert('Clients updated successfully!');
        fetchClientsAndQuotes();
      } else {
        alert('Failed to save clients');
      }
    } catch (err) {
      alert('Failed to save clients');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveQuotes = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quotes })
      });
      if (res.ok) {
        alert('Quotes updated successfully!');
        fetchClientsAndQuotes();
      } else {
        alert('Failed to save quotes');
      }
    } catch (err) {
      alert('Failed to save quotes');
    } finally {
      setIsSaving(false);
    }
  };

  const addAdmin = () => setAdmins([...admins, { email: '', role: 'admin', password: '' }]);
  const addClient = () => setClients([...clients, { id: Date.now().toString(), name: '', email: '', password: '' }]);
  const addQuote = () => setQuotes([...quotes, { id: `PO-${Date.now()}`, clientId: '', service: '', customPrice: '', status: 'Pending', notes: '' }]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
        <button onClick={() => window.location.hash = ''} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Website
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Zero Trust Admin</h2>
          <p className="text-xs text-slate-400 text-center mb-8 font-medium">Secure portal for Shreyanvisoft management.</p>
          
          {loginStep === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Admin Email (e.g. sales@shreyanvisoft.com)" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white focus:border-blue-500 focus:outline-none" 
              />
              <button type="submit" disabled={isVerifying} className="w-full premium-button text-white font-black py-4 rounded-xl text-xs tracking-widest uppercase transition-all">
                {isVerifying ? 'Sending...' : 'Request OTP'}
              </button>
              <button type="button" onClick={() => { setLoginStep('auth'); setAuthMethod('password'); }} className="w-full text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold mt-4">
                Or Login with Password
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {authMethod === 'otp' ? (
                <input 
                  type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP" maxLength={6}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white focus:border-cyan-500 focus:outline-none tracking-[0.5em] text-center" 
                />
              ) : (
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter Password" 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white focus:border-cyan-500 focus:outline-none" 
                />
              )}
              <button type="submit" disabled={isVerifying} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black py-4 rounded-xl text-xs tracking-widest uppercase transition-all">
                {isVerifying ? 'Verifying...' : 'Login'}
              </button>
              <button type="button" onClick={() => setLoginStep('email')} className="w-full text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold mt-4">
                Back
              </button>
            </form>
          )}
          {error && <p className="text-[10px] text-red-500 font-black mt-4 text-center uppercase tracking-widest">{error}</p>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Admin Control Panel</h1>
              <p className="text-xs text-slate-500 font-medium">Logged in as: {email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>

        <div className="flex flex-wrap gap-4 mb-8">
          <button onClick={() => setActiveTab('pricing')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'pricing' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            <Settings className="w-4 h-4" /> Pricing & Tax
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            <ShieldAlert className="w-4 h-4" /> Admins
          </button>
          <button onClick={() => setActiveTab('clients')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            <Users className="w-4 h-4" /> Client Users
          </button>
          <button onClick={() => setActiveTab('quotes')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'quotes' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            <FileText className="w-4 h-4" /> POs & Quotes
          </button>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
          {activeTab === 'pricing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-white mb-6">Service Pricing Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tax Rate (%)</label>
                  <input type="number" value={pricing.taxRate || ''} onChange={e => setPricing({...pricing, taxRate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" />
                </div>
                {Object.keys(pricing).filter(k => k !== 'taxRate').map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <input type="text" value={pricing[key] || ''} onChange={e => setPricing({...pricing, [key]: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={handleSavePricing} disabled={isSaving} className="premium-button px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Pricing'}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-white mb-6">Manage Administrators</h2>
              <div className="space-y-4">
                {admins.map((admin, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</label>
                      <input type="email" value={admin.email} onChange={e => { const newAdmins = [...admins]; newAdmins[idx].email = e.target.value; setAdmins(newAdmins); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" disabled={admin.role === 'superadmin'} />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</label>
                      <select value={admin.role} onChange={e => { const newAdmins = [...admins]; newAdmins[idx].role = e.target.value; setAdmins(newAdmins); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" disabled={admin.role === 'superadmin'}>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password (Optional)</label>
                      <input type="password" placeholder={admin.hasPassword ? "••••••••" : "Set password..."} onChange={e => { const newAdmins = [...admins]; newAdmins[idx].password = e.target.value; setAdmins(newAdmins); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    {admin.role !== 'superadmin' && (
                      <button onClick={() => setAdmins(admins.filter((_, i) => i !== idx))} className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/50 transition-colors h-[38px]">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-between items-center">
                <button onClick={addAdmin} className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">+ Add New Admin</button>
                <button onClick={handleSaveAdmins} disabled={isSaving} className="premium-button px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Admins'}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-white mb-6">Manage Client Access</h2>
              <div className="space-y-4">
                {clients.map((client, idx) => (
                  <div key={client.id} className="flex flex-col md:flex-row gap-4 items-end bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Name / Company</label>
                      <input type="text" value={client.name} onChange={e => { const newC = [...clients]; newC[idx].name = e.target.value; setClients(newC); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="Acme Corp" />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Email</label>
                      <input type="email" value={client.email} onChange={e => { const newC = [...clients]; newC[idx].email = e.target.value; setClients(newC); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" placeholder="client@acme.com" />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Set Password</label>
                      <input type="password" placeholder={client.hasPassword ? "••••••••" : "Set password..."} onChange={e => { const newC = [...clients]; newC[idx].password = e.target.value; setClients(newC); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                    </div>
                    <button onClick={() => setClients(clients.filter((_, i) => i !== idx))} className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/50 transition-colors h-[38px]">
                      Remove
                    </button>
                  </div>
                ))}
                {clients.length === 0 && <p className="text-sm text-slate-500 italic">No clients created yet.</p>}
              </div>
              <div className="mt-8 flex justify-between items-center">
                <button onClick={addClient} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest">+ Create Client User</button>
                <button onClick={handleSaveClients} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Clients'}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'quotes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-white mb-6">Generate POs & Quotes</h2>
              <div className="space-y-6">
                {quotes.map((quote, idx) => (
                  <div key={quote.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                      <span className="text-sm font-black text-indigo-400">{quote.id}</span>
                      <select value={quote.status} onChange={e => { const newQ = [...quotes]; newQ[idx].status = e.target.value; setQuotes(newQ); }} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs font-bold text-white focus:outline-none">
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign to Client</label>
                        <select value={quote.clientId} onChange={e => { const newQ = [...quotes]; newQ[idx].clientId = e.target.value; setQuotes(newQ); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                          <option value="">Select Client...</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Type</label>
                        <select value={quote.service} onChange={e => { const newQ = [...quotes]; newQ[idx].service = e.target.value; setQuotes(newQ); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                          <option value="">Select Service...</option>
                          <option value="Email Migration">Email Migration</option>
                          <option value="Tenant Setup">Tenant Setup</option>
                          <option value="Site Recovery">Site Recovery</option>
                          <option value="Professional Service (Manual)">Professional Service (Manual)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Adjusted Price (INR/USD)</label>
                        <input type="text" value={quote.customPrice} onChange={e => { const newQ = [...quotes]; newQ[idx].customPrice = e.target.value; setQuotes(newQ); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" placeholder="e.g. ₹50,000 or $1,000" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requirements / Notes</label>
                      <textarea value={quote.notes} onChange={e => { const newQ = [...quotes]; newQ[idx].notes = e.target.value; setQuotes(newQ); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none h-20" placeholder="Details about this quote..."></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setQuotes(quotes.filter((_, i) => i !== idx))} className="text-xs font-bold text-red-400 hover:text-red-300">Remove Quote</button>
                    </div>
                  </div>
                ))}
                {quotes.length === 0 && <p className="text-sm text-slate-500 italic">No quotes generated yet.</p>}
              </div>
              <div className="mt-8 flex justify-between items-center">
                <button onClick={addQuote} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1"><Plus className="w-4 h-4"/> Create PO / Quote</button>
                <button onClick={handleSaveQuotes} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Quotes'}
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
