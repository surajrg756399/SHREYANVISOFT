import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock, Zap, Shield, CreditCard } from 'lucide-react';

const WhyCard = ({ icon: Icon, title, desc, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="why-card rounded-[2.5rem] p-10 group hover:-translate-y-3 transition-all duration-300"
  >
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 text-blue-700 mb-6 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

export default function WhyUs() {
  return (
    <section id="why-us" className="py-32 relative z-10 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 text-blue-700 font-bold tracking-[0.2em] uppercase text-[10px] bg-blue-50 px-5 py-2.5 rounded-full mb-6 border border-blue-100 shadow-sm">
            <Star className="w-4 h-4 text-blue-600 fill-current" /> 
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900">
            Built for Speed, Security & <br />Reliable Delivery
          </h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
          <WhyCard icon={Clock} title="24/7 Support" desc="Quick response and issue resolution anytime." delay={0} />
          <WhyCard icon={Zap} title="Fast Deployment" desc="Rapid setup for cloud, backup, and email systems." delay={0.1} />
          <WhyCard icon={Shield} title="Secure Solutions" desc="Focus on data protection and cybersecurity." delay={0.2} />
          <WhyCard icon={CreditCard} title="Cost-Effective" desc="Affordable solutions for small and medium businesses." delay={0.3} />
        </div>
      </div>
    </section>
  );
}
