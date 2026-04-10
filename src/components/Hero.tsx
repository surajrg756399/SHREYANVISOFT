import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';

const Counter = ({ target, label, suffix = "", stringValue }: { target?: number, label: string, suffix?: string, stringValue?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && target !== undefined) {
      let start = 0;
      const duration = 2000;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return (
    <div ref={ref} className="stat-card rounded-3xl p-6 bg-white/85 backdrop-blur-md">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</div>
      <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
        {stringValue ? stringValue : `${count}${suffix}`}
      </div>
      <p className="text-slate-600 text-sm mt-3 font-medium">
        {label === 'Cloud Ready' && 'Support-driven service availability'}
        {label === 'Deployments' && 'Structured rollout approach'}
        {label === 'Security' && 'Focused on resilient operations'}
        {label === 'Global Access' && 'Browser-led server access worldwide'}
      </p>
    </div>
  );
};

export default function Hero() {
  return (
    <header className="relative overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background with subtle motion */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80" 
          alt="Infrastructure" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_10s_infinite]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-[#0f172a] opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/50 via-transparent to-cyan-500/20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-400/20 text-blue-300 px-6 py-3 rounded-2xl text-[11px] font-black tracking-[0.3em] uppercase mb-10 backdrop-blur-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_15px_#4ade80]"></span> 
            Global Infrastructure Operations Active
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 text-white leading-[0.95] tracking-tighter">
            Enterprise <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">IT Architecture</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium">
            Specializing in zero-downtime <span className="text-white">Tenant Migrations</span>, global <span className="text-white">Remote Access</span>, and high-availability <span className="text-white">Server Deployments</span>.
          </p>
          
          <div className="flex flex-wrap gap-6 mb-20">
            <a href="#contact" className="premium-button px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 group">
              Request Deployment <span className="group-hover:translate-x-2 transition-transform">→</span>
            </a>
            <a href="#pricing" className="px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors backdrop-blur-md">
              Exclusive Enterprise Offer
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Counter target={24} label="Cloud Ready" suffix="/7" />
          <Counter target={100} label="Deployments" suffix="%" />
          <Counter target={99} label="Security" suffix="%" />
          <Counter label="Global Access" stringValue="Global" />
        </div>
      </div>
    </header>
  );
}
