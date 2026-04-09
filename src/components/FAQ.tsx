import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Plus, Minus, Search, X } from 'lucide-react';

const FAQItem = ({ question, answer, isAmber = false }: { question: string, answer: string, isAmber?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="faq-btn w-full text-left px-8 py-6 font-bold text-slate-800 flex justify-between items-center focus:outline-none"
      >
        <span className="text-lg">{question}</span>
        <span className="text-emerald-500 transition-transform duration-300">
          {isOpen ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-t border-slate-100 overflow-hidden"
          >
            <div className={`px-8 pb-6 pt-4 text-sm leading-relaxed ${isAmber ? 'text-amber-800 font-bold' : 'text-slate-600 font-medium'}`}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const faqDb = Array.from({ length: 99 }, (_, i) => {
    const subjects = ['DNS Record Updates', 'Mailbox Synchronization', 'Automated Scraping Proxies', 'Server Disaster Recovery', 'RPA Variable Loops', 'SSL Certificate Binding', 'Remote Desktop Gateways', 'API Webhook Listeners', 'Incremental Cloud Backups'];
    const actions = ['How do we securely deploy', 'What is the standard failover for', 'Can we fully automate', 'How do you monitor latency in', 'What are the security constraints of', 'How does the system handle errors in'];
    const subj = subjects[i % subjects.length];
    const act = actions[(i * 2) % actions.length];
    return {
      question: `${act} ${subj}?`,
      answer: `Our standardized technical approach to ${subj} involves strict adherence to zero-downtime protocols. We utilize automated load balancers and encrypted storage vaults to ensure that every step of the process is resilient and highly secure. Support teams receive instant telemetry on these deployments.`
    };
  });

  const filteredFaqs = faqDb.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="py-28 bg-slate-50 relative z-10 border-t border-slate-200 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-[0.2em] uppercase text-[10px] bg-emerald-50 px-5 py-2.5 rounded-full mb-6 border border-emerald-100 shadow-sm">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Knowledge Base
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-slate-900">
            1001+ IT Solutions <br /><span className="text-emerald-600">FAQ Library.</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Search our database of questions regarding migrations, RPA bots, infrastructure, and web technologies.</p>
        </div>

        <div className="space-y-5 mb-14">
          <FAQItem 
            question="Are taxes and payment gateway charges included?" 
            answer="Yes, our regional pricing automatically calculates and includes standard local/international payment gateway and SWIFT transfer processing fees for a transparent billing experience. However, state/local government taxes are not included."
            isAmber
          />
          <FAQItem 
            question="How does Email Migration work and is there downtime?" 
            answer="Our ultra-premium migration service is designed for zero data loss and zero downtime. We transition your users in the background, sync contacts and calendars, and update DNS records during off-hours to ensure seamless continuity."
          />
          <FAQItem 
            question="What is included in the Premium Static Website Design?" 
            answer="Our premium static sites include ultra-fast HTML/JS coding, a modern UI/UX layout, forms setup, and standard inclusion of a basic AI Chatbot. Hosting setup and zero-maintenance architecture are standard."
          />
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => setShowModal(true)}
            className="text-white bg-emerald-600 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-700 transition shadow-lg hover:shadow-emerald-500/30"
          >
            Load More from the 1000+ FAQ Database...
          </button>
        </div>
      </div>

      {/* FAQ Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay open">
            <div className="w-full border-b border-emerald-900/50 bg-slate-900/95 p-6 flex justify-between items-center shrink-0 rounded-t-[2rem] max-w-7xl mx-auto mt-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Technical FAQ Database</h2>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">1001+ IT Infrastructure & Solution Questions</p>
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
                  placeholder="Search technical questions (e.g. DNS, Automation, Servers)..." 
                  className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-full py-4 pl-14 pr-6 focus:outline-none focus:border-emerald-500 shadow-inner font-medium" 
                />
              </div>
            </div>
            <div className="modal-content custom-scrollbar max-w-7xl mx-auto w-full bg-slate-900/95 rounded-b-[2rem]">
              <div className="max-w-4xl mx-auto space-y-5 pb-10">
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all">
                    <h3 className="text-xl font-black text-slate-800 mb-4">Q: {faq.question}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 font-medium">
                      <strong className="text-emerald-700 font-black">A:</strong> {faq.answer}
                    </p>
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
