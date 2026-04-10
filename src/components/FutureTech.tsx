import React from 'react';
import { motion } from 'motion/react';

export default function FutureTech() {
  return (
    <section id="future-tech" className="py-24 bg-[#0f172a] relative z-10 border-t border-slate-800 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="inline-block px-5 py-2 rounded-full border border-slate-700 bg-slate-800 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm"
          >
            Coming Soon
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Robotics Design &<br /><span className="text-blue-400">Future Technologies</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto font-medium">
            We are pioneering the next generation of physical and digital automation. Explore our upcoming R&D initiatives.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🦾', title: 'Autonomous Robotic Workforce', desc: 'Integration of AI-driven humanoid and mechanical robotics designed for structured physical tasks, warehousing, and advanced operational logistics.' },
            { icon: '🧠', title: 'Cognitive IoT Infrastructure', desc: 'Smart sensors and edge-computing networks that allow your physical office space to communicate seamlessly and securely with your digital cloud.' },
            { icon: '🛸', title: 'Automated Drone Management', desc: 'Software integration systems for managing commercial drone fleets, enabling rapid delivery protocols, site inspections, and automated routing.' },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-800/40 border border-slate-700/60 rounded-[1.5rem] p-8 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-6 border border-slate-600/50 shadow-inner">
                <span className="text-2xl">{item.icon}</span>
              </div>
              <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
