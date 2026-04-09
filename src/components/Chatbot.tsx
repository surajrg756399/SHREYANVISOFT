import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, ShieldCheck, Mail } from 'lucide-react';
import intlTelInput from 'intl-tel-input';
import Logo from './Logo';

const ChatForm = ({ onSubmit, msgIdx, formSubmitted }: { onSubmit: (e: React.FormEvent, idx: number, phone: string) => void, msgIdx: number, formSubmitted: boolean }) => {
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [iti, setIti] = useState<any>(null);
  const [phoneError, setPhoneError] = useState(false);

  useEffect(() => {
    if (phoneInputRef.current) {
      const instance = intlTelInput(phoneInputRef.current, {
        initialCountry: "in",
        separateDialCode: true,
        strictMode: false,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.4/build/js/utils.js"
      } as any);
      setIti(instance);
      return () => instance.destroy();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(false);
    if (iti) {
      // Very permissive validation: just check if there are at least 8 digits
      const rawValue = phoneInputRef.current?.value.replace(/\D/g, '') || '';
      if (rawValue.length < 8) {
        setPhoneError(true);
        phoneInputRef.current?.focus();
        return;
      }
    }
    onSubmit(e, msgIdx, iti ? iti.getNumber() : '');
  };

  if (formSubmitted) {
    return (
      <div className="text-xs tracking-wide font-black text-green-700 flex items-center gap-3 bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm mt-2">
        <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" /> 
        Details securely sent! We will email you shortly.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-md mt-2 w-full">
      <p className="text-[10px] font-black text-blue-700 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600" /> Secure Details Entry
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
        <input type="text" name="Name" placeholder="Full Name" required className="px-4 py-3 rounded-xl text-sm border border-slate-300 focus:outline-none focus:border-blue-500 shadow-sm w-full bg-white text-slate-900 font-bold transition-all" />
        <input type="email" name="Email" placeholder="Email Address" required className="px-4 py-3 rounded-xl text-sm border border-slate-300 focus:outline-none focus:border-blue-500 shadow-sm w-full bg-white text-slate-900 font-bold transition-all" />
        <div className="w-full">
          <input ref={phoneInputRef} type="tel" name="Phone" placeholder="Phone Number" required className="px-4 py-3 rounded-xl text-sm border border-slate-300 focus:outline-none focus:border-blue-500 shadow-sm w-full bg-white text-slate-900 font-bold transition-all" />
        </div>
        {phoneError && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-xl mt-1">
            <p className="text-[10px] text-red-600 font-black uppercase tracking-widest leading-tight">
              ⚠️ Please enter a valid phone number for the selected country.
            </p>
          </div>
        )}
        <button type="submit" className="mt-2 w-full premium-button text-white font-black text-xs tracking-[0.2em] uppercase py-3.5 rounded-xl shadow-md flex justify-center items-center gap-2">
          Submit Details <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string, content: string, showForm?: boolean, isError?: boolean }[]>([
    { role: 'assistant', content: 'Greetings. I am the SHREYANVISOFT™ Executive AI. I am here to provide you with ultra-premium IT solutions, cloud VM strategies, and architectural insights. How may I assist your enterprise today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState<Record<number, boolean>>({});

  const historyRef = useRef<HTMLDivElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (customMsg?: string) => {
    const messageToSend = customMsg || inputValue;
    if (!messageToSend.trim() || isTyping) return;

    const userMessage = messageToSend.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    if (!customMsg) setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          model: 'llama', 
          history: messages.map(m => ({ role: m.role, content: m.content })) 
        })
      });
      
      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, showForm: data.showForm }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "⚠️ Connection Error. Our AI systems are currently under high load.",
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent, msgIdx: number, phone: string) => {
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    const submitBtn = form.querySelector('button');
    if (submitBtn) {
      submitBtn.innerText = 'Sending securely...';
      submitBtn.disabled = true;
    }

    let historyText = "=== NEW AI CHATBOT LEAD ===\n\n";
    messages.forEach(msg => { 
      historyText += (msg.role === 'user' ? 'Customer: ' : 'AI Agent: ') + msg.content + '\n\n'; 
    });
    formData.set('Phone', phone);
    formData.append("Lead_Source", "Embedded Chat Widget");
    formData.append("Full_Chat_Transcript", historyText);

    try {
      const response = await fetch("/api/lead", {
        method: "POST", 
        body: formData, 
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        setFormSubmitted(prev => ({ ...prev, [msgIdx]: true }));
      } else {
        throw new Error();
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.innerText = 'Error. Try Again.';
        submitBtn.disabled = false;
      }
    }
  };

  return (
    <div className="chat-bot">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="chat-button group" 
        aria-label="Open chat"
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {isOpen ? <X className="w-8 h-8 relative z-10" /> : <MessageSquare className="w-8 h-8 relative z-10" />}
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-[#0f172a] rounded-full z-20 shadow-[0_0_10px_#4ade80] animate-pulse"></span>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="chat-panel open"
          >
            <div className="shrink-0 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-white/20 shadow-2xl p-2">
                      <Logo />
                      <div className="absolute inset-0 pointer-events-none rounded-2xl animate-[pulse_2s_infinite]">
                        <div className="absolute inset-0 bg-blue-400/10 rounded-2xl blur-md"></div>
                      </div>
                    </div>
                    <div>
                      <div className="font-black text-2xl tracking-tight leading-none text-white drop-shadow-lg">Executive AI</div>
                      <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span>
                        Active Protocol
                      </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div ref={historyRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'max-w-[85%]'}`}>
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-xl shadow-sm border border-blue-200">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className="w-full flex flex-col gap-3">
                    <div className={`${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' : (msg.isError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-white border border-slate-200 text-slate-700')} p-4 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'} shadow-sm text-sm leading-relaxed font-medium`}>
                      {msg.content}
                      {msg.isError && (
                        <div className="mt-3 pt-3 border-t border-red-200/50">
                          <a 
                            href="mailto:sales@shreyanvisoft.com" 
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-md"
                          >
                            <Mail className="w-3 h-3" /> Email Sales Directly
                          </a>
                        </div>
                      )}
                    </div>
                    {msg.showForm && (
                      <ChatForm 
                        onSubmit={handleFormSubmit} 
                        msgIdx={idx} 
                        formSubmitted={!!formSubmitted[idx]} 
                      />
                    )}
                    {idx === 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleSend("Suggest best Cloud VMs for my business")}
                          className="text-[10px] font-black bg-white/5 hover:bg-blue-600/20 text-slate-600 hover:text-blue-700 px-4 py-2.5 rounded-xl border border-slate-200 transition-all uppercase tracking-widest"
                        >
                          VM Strategy
                        </button>
                        <button 
                          onClick={() => handleSend("Tell me about Knowledge Base & Blog services")}
                          className="text-[10px] font-black bg-white/5 hover:bg-blue-600/20 text-slate-600 hover:text-blue-700 px-4 py-2.5 rounded-xl border border-slate-200 transition-all uppercase tracking-widest"
                        >
                          Knowledge Base
                        </button>
                        <a 
                          href="#ai-demos"
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-black bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-xl shadow-lg transition-all uppercase tracking-widest flex items-center gap-2"
                        >
                          AI Playground <Bot className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-xl shadow-sm border border-slate-300">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-sm shadow-sm border border-blue-200">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white border border-slate-200 text-slate-500 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-12">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="shrink-0 p-5 bg-white border-t border-slate-100 relative z-[10001]">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="field-bg flex-1 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-blue-500" 
                  placeholder="Ask me anything..." 
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isTyping}
                  className="premium-button text-white w-14 h-14 flex items-center justify-center rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
