import React, { useState, useEffect } from 'react';
import { ChevronDown, Mail, Globe, Database, ShieldAlert, Cpu, Server, Bot, Zap, Search, MonitorDot, CreditCard, Layout, BookOpen, HelpCircle, Sparkles, Users } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`glass-nav sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'h-20' : 'h-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center gap-4">
          <div 
            className="flex-shrink-0 flex items-center gap-3.5 cursor-pointer group" 
            onClick={scrollToTop}
          >
            <div className="w-16 h-10 transition-transform group-hover:scale-105">
              <Logo />
            </div>
            <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1 bg-green-50 border border-green-100 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
              <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Systems Active</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 tracking-wide">
            <div className="relative group py-8">
              <a href="#services" className="hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer">
                Services <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </a>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[640px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_40px_100px_rgba(15,23,42,0.2)] border border-slate-200/60 p-6 z-50">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: '01', name: 'Email Migrations', desc: 'Seamless workspace transitions', icon: <Mail className="w-5 h-5" /> },
                    { id: '02', name: 'Web Design', desc: 'Ultra-premium digital presence', icon: <Globe className="w-5 h-5" /> },
                    { id: '03', name: 'Data Backups', desc: 'Enterprise-grade data safety', icon: <Database className="w-5 h-5" /> },
                    { id: '04', name: 'Disaster Recovery', desc: 'Business continuity protocols', icon: <ShieldAlert className="w-5 h-5" /> },
                    { id: '05', name: 'Cloud VMs', desc: 'High-performance computing', icon: <Cpu className="w-5 h-5" /> },
                    { id: '06', name: 'IT Solutions', desc: 'Custom architectural strategies', icon: <Server className="w-5 h-5" /> },
                    { id: '07', name: 'AI Chat Bot', desc: 'Intelligent customer engagement', icon: <Bot className="w-5 h-5" />, href: '#high-demand' },
                    { id: '08', name: 'RPA BOT', desc: 'Process automation efficiency', icon: <Zap className="w-5 h-5" />, href: '#high-demand' },
                    { id: '09', name: 'Web Scraping', desc: 'Advanced data extraction', icon: <Search className="w-5 h-5" />, href: '#high-demand' },
                    { id: '10', name: 'Remote Connection', desc: 'Secure global access', icon: <MonitorDot className="w-5 h-5" />, href: '#high-demand' },
                  ].map((item) => (
                    <a 
                      key={item.id}
                      href={item.href || "#services"} 
                      className="flex items-start gap-4 p-4 rounded-2xl hover:bg-blue-50/80 border border-transparent hover:border-blue-100 transition-all group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all shadow-sm">
                        {item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-black text-blue-600/50 tracking-widest uppercase">{item.id}</span>
                          <span className="text-sm font-black text-slate-800 group-hover/item:text-blue-700">{item.name}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 leading-tight">{item.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Services Added Monthly</span>
                  </div>
                  <a href="#contact" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Request Custom Solution</a>
                </div>
              </div>
            </div>

            <div className="relative group py-8">
              <a href="#pricing" className="hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer">
                Pricing <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </a>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[320px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_40px_100px_rgba(15,23,42,0.2)] border border-slate-200/60 p-4 z-50 flex flex-col gap-1">
                <div className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 mb-2">Enterprise Pricing</div>
                {[
                  { name: 'Email Migrations', href: '#pricing-email', icon: <Mail className="w-4 h-4" /> },
                  { name: 'Tenant Setup', href: '#pricing-tenant', icon: <Zap className="w-4 h-4" /> },
                  { name: 'Site Recovery', href: '#pricing-recovery', icon: <ShieldAlert className="w-4 h-4" /> },
                  { name: 'Backup & Replication', href: '#pricing-backup', icon: <Database className="w-4 h-4" /> },
                  { name: 'Remote Access', href: '#pricing-remote', icon: <MonitorDot className="w-4 h-4" /> },
                  { name: 'Virtual Machines', href: '#pricing-vm', icon: <Cpu className="w-4 h-4" /> },
                  { name: 'Cloud VM Setup', href: '#pricing-cloud', icon: <Server className="w-4 h-4" /> },
                  { name: 'Premium Web Design', href: '#pricing-web', icon: <Layout className="w-4 h-4" /> },
                ].map((item) => (
                  <a 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50/80 hover:text-blue-700 text-sm font-black text-slate-800 transition-all group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-blue-100 group-hover/item:text-blue-600 transition-all">
                      {item.icon}
                    </div>
                    {item.name}
                  </a>
                ))}
                <div className="mt-2 p-3 bg-blue-600 rounded-2xl text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Custom Quotes</span>
                  </div>
                  <p className="text-[10px] font-medium opacity-90 leading-tight">Get tailored pricing for large-scale enterprise deployments.</p>
                </div>
              </div>
            </div>

            <div className="relative group py-8">
              <a href="#blog" className="hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer">
                Knowledge Base <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </a>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[320px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_40px_100px_rgba(15,23,42,0.2)] border border-slate-200/60 p-5 z-50 flex flex-col gap-2">
                <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 mb-1">Premium Resources</div>
                <a href="#blog" className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-blue-50/80 hover:text-blue-700 transition-all group/item">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-800">Premium Insights</span>
                    <span className="block text-[10px] font-medium text-slate-500">Expert industry analysis</span>
                  </div>
                </a>
                <a href="#blog" className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-cyan-50/80 hover:text-cyan-700 transition-all group/item">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover/item:bg-cyan-600 group-hover/item:text-white transition-all shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-800">Case Studies</span>
                    <span className="block text-[10px] font-medium text-slate-500">Real-world success stories</span>
                  </div>
                </a>
                <a href="#faq" className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-indigo-50/80 hover:text-indigo-700 transition-all group/item">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all shadow-sm">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-800">FAQ & Support</span>
                    <span className="block text-[10px] font-medium text-slate-500">Get instant answers</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="relative group py-8">
              <a href="#ai-demos" className="hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer">
                AI Demos <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </a>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[240px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-200/60 p-4 z-50 flex flex-col gap-2">
                <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 mb-1">Interactive Tech</div>
                <a href="#ai-demos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50/50 hover:text-blue-700 transition-all group/item">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <span className="text-sm">✨</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">AI Playground</span>
                </a>
                <a href="#high-demand" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50/50 hover:text-blue-700 transition-all group/item">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white">
                    <span className="text-sm">🤖</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">RPA Solutions</span>
                </a>
              </div>
            </div>

            <a href="#footer-policies" className="hover:text-blue-700 transition-colors py-8">Policies</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#client" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-600 transition-colors px-4 py-2 rounded-full hover:bg-cyan-50 border border-transparent hover:border-cyan-100">
              <Users className="w-3.5 h-3.5" /> Client Portal
            </a>
            <a href="#admin" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors px-4 py-2 rounded-full hover:bg-blue-50 border border-transparent hover:border-blue-100">
              <ShieldAlert className="w-3.5 h-3.5" /> Admin Portal
            </a>
            <a href="#contact" className="premium-button px-8 py-3.5 rounded-full font-bold inline-flex items-center gap-2 uppercase tracking-widest text-[11px]">
              Get a Quote
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
