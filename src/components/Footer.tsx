import React from 'react';
import { Shield, Lock, FileText, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer-policies" className="bg-slate-950 text-slate-300 pt-24 pb-12 border-t border-slate-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 w-full mb-20 text-left text-sm pb-20 border-b border-white/5">
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
            <h4 className="font-black text-white mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-500" />
              Site Structure
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Home / Hero', link: '#' },
                { name: 'Services Overview', link: '#services' },
                { name: 'High Demand Solutions', link: '#high-demand' },
                { name: 'Future Tech (AI/RPA)', link: '#future-tech' },
                { name: 'AI Playground (Demo)', link: '#ai-demos' },
                { name: 'Pricing Plans', link: '#pricing' },
                { name: 'Case Studies / Blog', link: '#blog' },
                { name: 'Contact & Support', link: '#contact' }
              ].map((item) => (
                <li key={item.name}>
                  <a href={item.link} className="text-slate-500 hover:text-blue-400 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <h4 className="font-black text-white mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-500" />
              Privacy Policy
            </h4>
            <p className="text-slate-400 mb-4 font-medium">Information Collection & Handling:</p>
            <ul className="text-slate-400 list-disc pl-5 space-y-3 font-medium">
              <li>We are committed to protecting your privacy.</li>
              <li>Ensuring that your personal information is handled in a safe and responsible manner at all times.</li>
            </ul>
          </div>
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <h4 className="font-black text-white mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-500" />
              Terms & Conditions
            </h4>
            <p className="text-slate-400 mb-4 font-medium">Project and payment terms:</p>
            <ul className="text-slate-400 list-disc pl-5 space-y-3 font-medium">
              <li>We will provide the best service quality based on requirements.</li>
              <li>Payment terms: 50% advanced, 50% after work is completed.</li>
              <li>Delivery timelines depend on project complexity and customer approvals.</li>
              <li>Support and revisions are handled according to active SLA agreements.</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center relative">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-[0.2em] text-white flex items-center gap-2">
              ENTERPRISE 
              <span className="text-[10px] align-top bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">INC</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 font-medium mb-2">Your trusted IT, automation, backup, and remote workspace partner.</p>
          <p className="text-sm text-slate-400 font-medium mb-8 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            Email: <a href="mailto:sales@company.com" className="text-blue-400 hover:text-blue-300 transition-colors">sales@company.com</a>
          </p>
          
          <p className="text-sm text-slate-400 font-medium mb-2">Govt. of India Recognized MSME (Udyam Registered)</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-full mb-4">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">Govt. of India Registered MSME</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">&copy; {new Date().getFullYear()} Enterprise. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
