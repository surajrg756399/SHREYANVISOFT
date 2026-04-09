import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Search, X } from 'lucide-react';

export default function Blog() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const caseStudies = Array.from({ length: 99 }, (_, i) => {
    const servicesData = ['Cloud Workspace Migration', 'RPA Process Automation', 'Premium Web Architecture', 'AI Conversational Agent', 'Automated Data Extraction', 'Global Remote Access', 'Enterprise Data Backup'];
    const industryData = ['Healthcare', 'Financial Services', 'Retail Network', 'Global Logistics', 'Manufacturing', 'Real Estate', 'EdTech', 'Legal Sector', 'E-commerce', 'SaaS Innovators'];
    const metricData = ['Strategies for achieving zero-downtime transition protocols.', 'Methodologies for reducing manual processing time significantly.', 'Architectural approaches to increasing user conversion rates.', 'Frameworks for resolving L1 support queries instantly using AI.', 'Best practices for automating highly complex daily reporting pipelines.', 'Security protocols for enabling low-latency access for remote workers.', 'Guidelines for ensuring 100% data recovery capability within minutes.'];
    
    const srv = servicesData[i % servicesData.length];
    const ind = industryData[(i * 3) % industryData.length];
    const out = metricData[(i * 5) % metricData.length];
    
    return {
      service: srv,
      industry: ind,
      metric: out,
      title: `Architecture Guide: ${srv} in ${ind}`
    };
  });

  const filteredCaseStudies = caseStudies.filter(cs => 
    cs.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cs.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cs.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="blog" className="py-32 bg-gradient-to-b from-slate-900 to-slate-950 relative z-10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 text-cyan-400 font-bold tracking-[0.2em] uppercase text-[10px] bg-cyan-900/30 px-5 py-2.5 rounded-full mb-6 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Knowledge Base
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter">
            Premium Insights & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Knowledge Base</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            Deep dive into enterprise-grade architectural strategies, cloud optimization guides, and real-world case studies from SHREYANVISOFT™.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {[
            { tag: 'Cloud VM Architecture', desc: 'Expert guidelines on selecting the best Virtual Machines for your workload, optimizing for both performance and cost-efficiency.', icon: '☁️' },
            { tag: 'Automated Disaster Recovery', desc: 'Discover our proactive architectural strategies for real-time backup monitoring and military-grade ransomware defense systems.', icon: '🛡️' },
            { tag: 'Knowledge Base & Blog', desc: 'Learn how to implement a high-performance knowledge base and blog service to empower your team and customers.', icon: '📚' },
          ].map((item, idx) => (
            <motion.article 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-b from-blue-500/30 via-transparent to-transparent group hover:shadow-[0_0_50px_rgba(37,99,235,0.2)] transition-all"
            >
              <div className="relative h-full bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/5 transition-all duration-500 group-hover:-translate-y-3 group-hover:bg-slate-800/90">
                <div className="text-4xl mb-6">{item.icon}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-5">{item.tag}</div>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            </motion.article>
          ))}

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={() => setShowModal(true)}
            className="block relative rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-cyan-600 group cursor-pointer shadow-lg hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            <div className="relative z-10 h-full p-8 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-5 backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Case Studies</h3>
              <p className="text-blue-100 text-sm font-medium leading-relaxed">Unlock our entire library of premium architectural guides.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Case Studies Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay open">
            <div className="w-full border-b border-white/10 bg-slate-900/90 p-6 flex justify-between items-center shrink-0 rounded-t-[2rem] max-w-7xl mx-auto mt-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Case Studies Library</h2>
                <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">99 Architectural Strategies & Guidelines</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full bg-slate-900/80 p-6 border-b border-white/5 shrink-0 flex justify-center max-w-7xl mx-auto">
              <div className="relative w-full max-w-2xl">
                <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search knowledge base (e.g. Migration, RPA, Security)..." 
                  className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-full py-4 pl-14 pr-6 focus:outline-none focus:border-cyan-500 shadow-inner font-medium" 
                />
              </div>
            </div>
            <div className="modal-content custom-scrollbar max-w-7xl mx-auto w-full bg-slate-900/95 rounded-b-[2rem]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                {filteredCaseStudies.map((cs, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 hover:border-cyan-500/50 transition-all">
                    <span className="inline-block px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-full mb-4 border border-cyan-500/20 tracking-[0.2em] uppercase">{cs.service}</span>
                    <h3 className="text-xl font-black text-white mb-3 leading-tight">{cs.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5 font-medium">{cs.metric}</p>
                    <div className="flex items-center text-xs font-black text-blue-400 tracking-widest uppercase">
                      <span className="hover:text-blue-300 transition-colors cursor-pointer border-b-2 border-transparent hover:border-blue-400 pb-0.5">Read Strategy Document &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
