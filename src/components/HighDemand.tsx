import React from 'react';
import { motion } from 'motion/react';

export default function HighDemand() {
  return (
    <section id="high-demand" className="relative z-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex flex-col lg:flex-row gap-8 bg-white/80 backdrop-blur-xl border border-white p-6 rounded-[3rem] shadow-xl"
      >
        <div className="relative w-full lg:w-5/12 rounded-[2.5rem] overflow-hidden min-h-[420px] flex items-center p-8 lg:p-12 group shadow-inner">
          <img 
            src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80" 
            alt="New High Demand Services" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/60 transition-colors duration-500 group-hover:bg-slate-900/50"></div>
          <div className="relative z-10 w-full">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-md">Enterprise Automation</h2>
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full text-white text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span> 
              New High Demand Services
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-7/12 p-4 lg:py-8 lg:px-10 flex flex-col justify-center">
          <div className="mb-8">
            <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-5 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
              High Demand Solutions
            </span>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
            {[
              { title: 'AI Chat Bot', desc: 'Smart website-based assistance for leads, FAQs, service triage, and faster customer interaction.' },
              { title: 'RPA BOT', desc: 'Automate repetitive operational tasks, status checks, workflow handling, and structured business processes.' },
              { title: 'Web Scraping', desc: 'Collect website data for analysis, monitoring, research workflows, and business reporting requirements.' },
              { title: 'Remote Connection Through Website Globally', desc: 'Secure browser-based access to your servers, physical servers, and cloud VMs from anywhere.' },
            ].map((item, idx) => (
              <div key={idx}>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
