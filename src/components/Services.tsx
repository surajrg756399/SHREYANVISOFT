import React from 'react';
import { CheckCircle2, Zap, ShieldCheck, Database, Server, Settings } from 'lucide-react';
import { motion } from 'motion/react';

const ServiceCard = ({ title, items, image, badge, icon: Icon }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="service-card relative rounded-[2.5rem] overflow-hidden group border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500"
  >
    {badge && (
      <div className="absolute top-6 right-6 z-20 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full shadow-lg">
        {badge}
      </div>
    )}
    <div className="relative h-72 overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
      <div className="absolute bottom-8 left-8 z-10">
        <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl w-fit mb-4 border border-white/20 shadow-2xl">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-3xl font-black text-white leading-tight tracking-tighter" dangerouslySetInnerHTML={{ __html: title }}></h3>
      </div>
    </div>
    <div className="p-10 bg-white">
      <ul className="space-y-5">
        {items.map((item: string, idx: number) => (
          <li key={idx} className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mr-4 shrink-0 mt-0.5 border border-blue-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-slate-600 font-bold text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item }}></span>
          </li>
        ))}
      </ul>
      <div className="mt-10 pt-8 border-t border-slate-100">
        <a href="#contact" className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
          Get Expert Quote <Zap className="w-4 h-4 fill-blue-600" />
        </a>
      </div>
    </div>
  </motion.div>
);

export default function Services() {
  const services = [
    {
      title: "Tenant Setup <br/>& Email Migrations",
      image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80",
      badge: "★ High Demand",
      icon: ShieldCheck,
      items: [
        "Google Workspace to M365 migrations.",
        "Suspended account routing & OneDrive provisioning.",
        "Zero data loss & zero downtime guarantee."
      ]
    },
    {
      title: "Global Web-Based <br/>Remote Access",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      badge: "★ Enterprise",
      icon: Zap,
      items: [
        "Secure access to Physical Servers & VMs.",
        "Web-based global connectivity (No VPN needed).",
        "Advanced 2FA & active server monitoring."
      ]
    },
    {
      title: "Azure Site Recovery <br/>& Backup Replication",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
      icon: Database,
      items: [
        "Robust Backup Replication Solutions.",
        "Full Azure Site Recovery implementations.",
        "Disaster recovery for 24/7 availability."
      ]
    },
    {
      title: "Physical & Virtual <br/>Server Setup",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
      icon: Server,
      items: [
        "Lenovo/Windows Server 2025 racking.",
        "VMware & Exchange Server 2019 labs.",
        "AD replication & time sync troubleshooting."
      ]
    },
    {
      title: "Email Backup <br/>& Security Solutions",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      icon: Settings,
      items: [
        "Secure corporate communication backups.",
        "Ransomware-proof immutable storage.",
        "Compliance-ready data archiving."
      ]
    },
    {
      title: "IT Infrastructure <br/>& Cloud Consulting",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
      icon: Zap,
      items: [
        "Tailored infrastructure upgrades.",
        "Network security & compliance audits.",
        "Global IT deployment & management."
      ]
    }
  ];

  return (
    <section id="services" className="relative z-20 pb-16 pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 scroll-mt-28">
      <div className="premium-panel rounded-[3rem] p-6 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent">Comprehensive Cloud Solutions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, idx) => (
            <ServiceCard key={idx} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
