import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Send, Bot, ShieldAlert, User, Terminal } from 'lucide-react';

export default function AIPlayground() {
  const [isAIVerified, setIsAIVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [demoUsageCount, setDemoUsageCount] = useState(0);
  const [messages, setMessages] = useState<{ role: string, content: string, isError?: boolean }[]>([
    { role: 'assistant', content: 'System initialized. I am ready to demonstrate enterprise AI capabilities. What would you like to test?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama');
  const [isTyping, setIsTyping] = useState(false);
  
  // Verification State
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Admin State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminStep, setAdminStep] = useState(1);
  const [adminId, setAdminId] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [adminError, setAdminError] = useState('');
  const [generatedAdminOtp, setGeneratedAdminOtp] = useState('');

  const historyRef = useRef<HTMLDivElement>(null);
  const MAX_FREE_PROMPTS = 5;

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminRole = localStorage.getItem('adminRole');
    if (adminToken && (adminRole === 'superadmin' || adminRole === 'admin')) {
      setIsAdmin(true);
      setIsAIVerified(true);
    }
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    setIsVerifying(true);
    
    try {
      const response = await fetch("/api/ai/unlock", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, email: userEmail, phone: userPhone })
      });
      const data = await response.json() as any;
      if (data.success) {
        setIsAIVerified(true);
        localStorage.setItem('ai_verified', 'true');
      } else {
        setVerifyError(data.error || "Failed to verify access.");
      }
    } catch (err) {
      setVerifyError("Network error. Please email sales@shreyanvisoft.com if this persists.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    if (!isAdmin && demoUsageCount >= MAX_FREE_PROMPTS) {
      alert("You have reached your free demo limit! Ready to build this into your own business? Please fill out the contact form below.");
      window.location.hash = "#contact";
      return;
    }

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    if (!isAdmin) {
      setDemoUsageCount(prev => prev + 1);
    }

    try {
      const response = await fetch("/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, model: selectedModel, history: messages.slice(1) })
      });
      
      if (!response.ok) throw new Error("Server Error");
      const data = await response.json() as any;
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, showForm: data.showForm }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "⚠️ Connection Error. Our AI servers are currently under high load.",
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAdminVerifyId = async () => {
    if (adminId === 'SHREYANVISOFT') {
      setAdminError('');
      setIsVerifying(true);

      try {
        const response = await fetch("/api/otp/send", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminId, type: 'admin' })
        });
        const data = await response.json();
        if (data.success) {
          setAdminStep(2);
        } else {
          setAdminError("Failed to send Admin OTP.");
        }
      } catch (err) {
        setAdminError("Failed to connect to security server. Email sales@shreyanvisoft.com.");
      } finally {
        setIsVerifying(false);
      }
    } else {
      setAdminError("ID is incorrect");
    }
  };

  const handleAdminVerifyOtp = async () => {
    setAdminError('');
    setIsVerifying(true);

    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'sales@shreyanvisoft.com', otp: adminOtp })
      });
      const data = await response.json();
      if (data.success) {
        setIsAdmin(true);
        setIsAIVerified(true);
        setShowAdminModal(false);
      } else {
        setAdminError("Incorrect OTP entered.");
      }
    } catch (err) {
      setAdminError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section id="ai-demos" className="py-24 relative z-20 bg-slate-900 scroll-mt-28 border-t border-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.15),transparent_40%)]"></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-cyan-400 font-bold tracking-[0.2em] uppercase text-[10px] bg-cyan-900/30 px-5 py-2.5 rounded-full mb-6 border border-cyan-500/20 shadow-sm">
            Live Free Demo
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            Test <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent">AI Capabilities.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto font-medium">
            Verify your business email to test the intelligence of our enterprise AI chatbots powered by Meta, Google, and Alibaba.
          </p>
        </div>

        <div className="ai-terminal p-1 shadow-2xl relative">
          <AnimatePresence mode="wait">
            {!isAIVerified && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md rounded-[2.5rem]"
              >
                <div className="bg-slate-900/95 p-8 md:p-10 rounded-[2.5rem] border border-white/10 text-center max-w-md w-full shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(37,99,235,0.3)] rotate-3">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Unlock Free AI Playground</h3>
                  <p className="text-xs text-slate-400 mb-8 font-medium tracking-wide">Enter your details to test our enterprise AI capabilities. <br/> <span className="text-cyan-400/80 mt-1 block italic">Free for enterprise clients</span></p>
                  
                  <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        required 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Full Name" 
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" 
                      />
                      <input 
                        type="email" 
                        required 
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Business Email" 
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" 
                      />
                      <input 
                        type="tel" 
                        required 
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="Phone Number" 
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isVerifying} 
                      className="w-full premium-button text-white font-black py-4 rounded-2xl text-xs tracking-[0.2em] uppercase transition-all shadow-lg disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isVerifying ? 'Unlocking...' : 'Unlock AI Playground'}
                    </button>
                  </form>

                  {verifyError && (
                    <p className="text-[10px] text-red-500 font-black mt-4 uppercase tracking-widest animate-pulse">
                      {verifyError}
                    </p>
                  )}
                  
                  <p className="text-[10px] text-slate-600 mt-8 text-center font-bold tracking-widest uppercase">
                    <ShieldAlert className="w-3 h-3 inline mr-1 mb-0.5" /> Secure Enterprise Verification
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-slate-900 rounded-[1.25rem] flex flex-col h-[500px]">
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700 rounded-t-[1.25rem]">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-4">Select AI Brain:</span>
              </div>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-cyan-400 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="llama">Llama 3 (General Chat)</option>
                <option value="qwen">Qwen Coder (Tech/Logic)</option>
                <option value="gemma">Google Gemma (Analysis)</option>
              </select>
            </div>
            
            <div ref={historyRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'max-w-[85%]'}`}>
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-sm border border-blue-500/30">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  <div className={`${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white' : (msg.isError ? 'bg-red-900/40 border-red-500/30 text-red-200' : 'bg-slate-800 border border-slate-700 text-slate-300')} p-3.5 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'} text-sm font-medium`}>
                    {msg.content}
                    {msg.showForm && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <a 
                          href="#contact" 
                          onClick={() => {
                            const contactSection = document.getElementById('contact');
                            if (contactSection) {
                              contactSection.scrollIntoView({ behavior: 'smooth' });
                              const serviceSelect = document.querySelector('select[name="service"]') as HTMLSelectElement;
                              if (serviceSelect) serviceSelect.value = "AI Chat Bot Integration";
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 w-full bg-cyan-500 text-slate-900 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg"
                        >
                          <Send className="w-4 h-4" /> Request Official Quote
                        </a>
                      </div>
                    )}
                    {msg.isError && (
                      <div className="mt-3 pt-3 border-t border-red-500/20">
                        <a 
                          href="mailto:sales@shreyanvisoft.com" 
                          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg"
                        >
                          <Send className="w-3 h-3" /> Contact Sales
                        </a>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-sm border border-slate-600">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-sm border border-blue-500/30">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 text-slate-500 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-12">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 rounded-b-[1.25rem]">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500" 
                  placeholder="Ask a technical question..." 
                  disabled={!isAIVerified}
                />
                <button 
                  onClick={handleSend}
                  disabled={!isAIVerified || isTyping}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  Status: <span className={`${isAdmin ? 'text-green-400' : 'text-amber-500'} font-bold`}>{isAdmin ? 'ADMIN ACTIVE' : (isAIVerified ? 'READY' : 'LOCKED')}</span>
                  <span className="mx-2">|</span>
                  Usage: <span>{isAdmin ? 'Unlimited' : `${demoUsageCount}/${MAX_FREE_PROMPTS}`}</span> Free Prompts
                </div>
                <a 
                  href="#admin"
                  className="text-[10px] text-slate-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-2.5 h-2.5" /> Admin
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center px-4">
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            * Llama 3 models are provided under the Meta Llama 3 Community License.<br />
            * Gemma models are provided under and subject to the Gemma Terms of Use.<br />
            * Cloudflare Workers AI acts as the inference engine for these open-weight models.<br />
            <a href="#footer-policies" className="text-slate-400 hover:text-white underline">View full Legal & Privacy terms</a>
          </p>
        </div>
      </div>
    </section>
  );
}
