import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, DollarSign, Globe } from 'lucide-react';

const exchangeRates: Record<string, { symbol: string, rate: number, feeMultiplier: number }> = {
  "INR": { symbol: "₹", rate: 1, feeMultiplier: 1.02 }, 
  "USD": { symbol: "$", rate: 0.0120, feeMultiplier: 1.05 }, 
  "EUR": { symbol: "€", rate: 0.0110, feeMultiplier: 1.05 },
  "GBP": { symbol: "£", rate: 0.0094, feeMultiplier: 1.05 },
  "AED": { symbol: "AED ", rate: 0.044, feeMultiplier: 1.05 },
  "AUD": { symbol: "A$", rate: 0.018, feeMultiplier: 1.05 },
  "CAD": { symbol: "C$", rate: 0.016, feeMultiplier: 1.05 },
  "SGD": { symbol: "S$", rate: 0.016, feeMultiplier: 1.05 }
};

export default function Pricing() {
  const [currency, setCurrency] = useState('INR');
  const [pricing, setPricing] = useState<any>({
    taxRate: 18,
    intlBankFee: 5,
    globalMarkup: 0,
    emailBasic: "5,100 - 10,200", emailStandard: "10,200 - 25,500", emailEnterprise: "25,500+",
    tenantBasic: "3,060 - 7,140", tenantStandard: "7,140 - 15,300", tenantEnterprise: "15,300+",
    siteRecoveryBasic: "8,160 - 15,300", siteRecoveryStandard: "15,300 - 40,800", siteRecoveryEnterprise: "40,800+",
    backupBasic: "5,100 - 10,200", backupStandard: "10,200 - 25,500", backupEnterprise: "25,500+"
  });

  useEffect(() => {
    fetch(`/api/pricing?t=${Date.now()}`)
      .then(res => res.json())
      .then((data: any) => {
        if (!data.error) setPricing(data);
      })
      .catch(console.error);
  }, []);

  const formatPriceStr = (valStr: string) => {
    if (!valStr) return "";
    const { symbol, rate } = exchangeRates[currency];
    
    // Calculate dynamic fee multiplier
    // If INR, use 1.02 (standard domestic fee)
    // If Intl, use 1 + (intlBankFee / 100)
    const dynamicFeeMultiplier = currency === 'INR' ? 1.02 : (1 + (parseFloat(pricing.intlBankFee || 5) / 100));
    const markupMultiplier = 1 + (parseFloat(pricing.globalMarkup || 0) / 100);
    const totalMultiplier = dynamicFeeMultiplier * markupMultiplier;
    
    // Check if it's a range like "5,100 - 10,200"
    if (valStr.includes('-')) {
      const parts = valStr.split('-');
      const min = parseInt(parts[0].replace(/,/g, ''));
      const max = parseInt(parts[1].replace(/,/g, ''));
      return `${formatNum(min, symbol, rate, totalMultiplier)} – ${formatNum(max, symbol, rate, totalMultiplier)}`;
    }
    
    // Check if it has a plus like "25,500+"
    const hasPlus = valStr.includes('+');
    const num = parseInt(valStr.replace(/,/g, '').replace(/\+/g, ''));
    return `${formatNum(num, symbol, rate, totalMultiplier)}${hasPlus ? '+' : ''}`;
  };

  const formatNum = (val: number, symbol: string, rate: number, multiplier: number) => {
    if (isNaN(val)) return "";
    const withFees = val * rate * multiplier;
    if (currency === 'INR') {
      return `${symbol}${Math.ceil(withFees).toLocaleString('en-IN')}`;
    }
    const rounded = Math.ceil(withFees / 5) * 5; 
    return `${symbol}${rounded.toLocaleString('en-US')}`;
  };

  const formatPrice = (val: number, plus = false) => {
    const { symbol, rate } = exchangeRates[currency];
    const dynamicFeeMultiplier = currency === 'INR' ? 1.02 : (1 + (parseFloat(pricing.intlBankFee || 5) / 100));
    const markupMultiplier = 1 + (parseFloat(pricing.globalMarkup || 0) / 100);
    const totalMultiplier = dynamicFeeMultiplier * markupMultiplier;
    return `${formatNum(val, symbol, rate, totalMultiplier)}${plus ? '+' : ''}`;
  };

  const formatRange = (min: number, max: number) => {
    const { symbol, rate } = exchangeRates[currency];
    const dynamicFeeMultiplier = currency === 'INR' ? 1.02 : (1 + (parseFloat(pricing.intlBankFee || 5) / 100));
    const markupMultiplier = 1 + (parseFloat(pricing.globalMarkup || 0) / 100);
    const totalMultiplier = dynamicFeeMultiplier * markupMultiplier;
    return `${formatNum(min, symbol, rate, totalMultiplier)} – ${formatNum(max, symbol, rate, totalMultiplier)}`;
  };

  return (
    <section id="pricing" className="py-24 relative z-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-indigo-700 font-bold tracking-[0.24em] uppercase text-[10px] bg-indigo-50 px-5 py-2.5 rounded-full mb-4 border border-indigo-100 shadow-sm">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            IT Services Pricing Plans
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900">
            Ultra Premium Implementation <br /><span className="text-blue-600">Transparent Pricing.</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">High-end enterprise solutions structured for your business scale.</p>
          <button 
            onClick={() => {
              fetch(`/api/pricing?t=${Date.now()}`)
                .then(res => res.json())
                .then((data: any) => {
                  if (!data.error) setPricing(data);
                });
            }}
            className="mt-4 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
          >
            ↻ Refresh Prices
          </button>
        </div>

        <div className="flex justify-center mb-10 relative z-20">
          <div className="bg-slate-50 p-2.5 rounded-2xl inline-flex flex-col items-center shadow-md border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="px-4 text-sm font-bold text-slate-600 hidden sm:block">Select Your Region:</span>
              <div className="relative">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 font-black text-base md:text-lg py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm appearance-none hover:border-blue-400 transition-colors"
                >
                  <option value="INR">🇮🇳 India (INR)</option>
                  <option value="USD">🇺🇸 United States (USD)</option>
                  <option value="EUR">🇪🇺 Europe (EUR)</option>
                  <option value="GBP">🇬🇧 United Kingdom (GBP)</option>
                  <option value="AED">🇦🇪 UAE (AED)</option>
                  <option value="AUD">🇦🇺 Australia (AUD)</option>
                  <option value="CAD">🇨🇦 Canada (CAD)</option>
                  <option value="SGD">🇸🇬 Singapore (SGD)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-2 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest text-center">
              Note: Displayed prices are estimated costs. Actual charges will be as per the final quote.
            </p>
          </div>
        </div>

        <div className="space-y-20">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
            
            <div className="relative z-10">
              <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] mb-6 inline-block shadow-[0_0_20px_rgba(6,182,212,0.5)]">Exclusive Enterprise Offer</span>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Cloud Tenant & <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">VM Architecture Consultation</span></h3>
              <p className="text-slate-300 font-medium max-w-3xl mx-auto mb-10 text-lg leading-relaxed">
                Ready to scale? We provide <span className="text-white font-bold underline decoration-cyan-500 underline-offset-4">Free Expert Consultation</span> for your Cloud Tenant creation and VM strategy. 
                Our architects suggest the best-fit Virtual Machines and infrastructure for your specific workload at zero initial cost.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl w-full md:w-64">
                  <div className="text-3xl font-black text-white mb-1">FREE</div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Initial Consultation</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl w-full md:w-64">
                  <div className="text-3xl font-black text-white mb-1">BEST</div>
                  <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Market Quotes</div>
                </div>
              </div>
              <a href="#contact" className="bg-white text-slate-950 px-12 py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.2)] inline-block hover:scale-105 transition-transform active:scale-95">
                Get Free Expert Advice
              </a>
            </div>
          </div>

          <div id="pricing-email" className="scroll-mt-28">
            <h3 className="text-2xl lg:text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
              <span className="text-3xl">📧</span> Email Migration Plans
            </h3>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { label: 'Basic', priceStr: pricing.emailBasic, items: ['Up to 10 users', 'Email + contacts migration'] },
                { label: 'Standard', priceStr: pricing.emailStandard, items: ['Up to 50 users', 'Full data migration + config'], popular: true },
                { label: 'Enterprise', priceStr: pricing.emailEnterprise, items: ['Unlimited users', 'Complex migration + support'] },
              ].map((plan, idx) => (
                <div key={idx} className={`pricing-card rounded-[2.5rem] p-10 ${plan.popular ? 'border-blue-400 shadow-[0_20px_50px_rgba(37,99,235,0.15)] relative transform md:-translate-y-4' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-md">Most Popular</div>
                  )}
                  <div className={`text-[10px] font-black uppercase tracking-[0.25em] ${plan.popular ? 'text-blue-600' : 'text-slate-400'} mb-3`}>{plan.label}</div>
                  <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-6">
                    {formatPriceStr(plan.priceStr)}
                  </div>
                  <ul className="space-y-4 mb-8 text-slate-600 font-medium">
                    {plan.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-blue-500" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div id="pricing-tenant" className="scroll-mt-28">
            <h3 className="text-2xl lg:text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
              <span className="text-3xl">🏢</span> Tenant Setup Plans
            </h3>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { label: 'Basic', priceStr: pricing.tenantBasic, desc: 'Basic setup (users + domain)' },
                { label: 'Standard', priceStr: pricing.tenantStandard, desc: 'Security + policies + admin setup' },
                { label: 'Enterprise', priceStr: pricing.tenantEnterprise, desc: 'Full configuration + compliance + optimization' },
              ].map((plan, idx) => (
                <div key={idx} className="pricing-card rounded-[2.5rem] p-8">
                  <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">{plan.label}</div>
                  <div className="text-2xl lg:text-3xl font-black text-slate-900 mb-4">
                    {formatPriceStr(plan.priceStr)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">{plan.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div id="pricing-recovery" className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm scroll-mt-28">
              <h3 className="text-xl lg:text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="text-2xl">🔄</span> Site Recovery Setup
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Basic', priceStr: pricing.siteRecoveryBasic, desc: 'Single server recovery' },
                  { label: 'Standard', priceStr: pricing.siteRecoveryStandard, desc: 'Multi-server + automation', highlight: true },
                  { label: 'Enterprise', priceStr: pricing.siteRecoveryEnterprise, desc: 'Full DR solution' },
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-5 border rounded-2xl transition-colors ${item.highlight ? 'border-blue-200 bg-blue-50/50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-blue-300'}`}>
                    <div>
                      <span className={`font-bold block ${item.highlight ? 'text-blue-800' : 'text-slate-800'}`}>{item.label}</span>
                      <span className={`text-xs font-medium mt-0.5 block ${item.highlight ? 'text-blue-600/80' : 'text-slate-500'}`}>{item.desc}</span>
                    </div>
                    <div className={`font-black text-lg ${item.highlight ? 'text-blue-900' : 'text-slate-800'}`}>
                      {formatPriceStr(item.priceStr)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div id="pricing-backup" className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm scroll-mt-28">
              <h3 className="text-xl lg:text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="text-2xl">💾</span> Backup & Replication
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Basic', priceStr: pricing.backupBasic, desc: 'Basic backup setup' },
                  { label: 'Standard', priceStr: pricing.backupStandard, desc: 'Backup + replication' },
                  { label: 'Enterprise', priceStr: pricing.backupEnterprise, desc: 'Automated backup + monitor' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-5 border border-slate-100 rounded-2xl bg-slate-50 hover:border-blue-300 transition-colors">
                    <div>
                      <span className="font-bold block text-slate-800">{item.label}</span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5 block">{item.desc}</span>
                    </div>
                    <div className="font-black text-slate-800 text-lg">
                      {formatPriceStr(item.priceStr)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div id="pricing-remote" className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm scroll-mt-28">
              <h3 className="text-xl lg:text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                <span className="text-2xl">🌐</span> Remote Access Setup
              </h3>
              <p className="text-[10px] text-blue-600 mb-8 uppercase tracking-widest font-bold">(Web-based on Physical System)</p>
              <div className="space-y-5 text-sm font-medium">
                {[
                  { label: 'Basic (Single user)', range: [5000, 10000] },
                  { label: 'Standard (Multi-user)', range: [10000, 20000], highlight: true },
                  { label: 'Enterprise (Secure workspace)', min: 20000 },
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between ${idx !== 2 ? 'border-b border-slate-100 pb-4' : 'pt-1'}`}>
                    <span className="text-slate-700">{item.label}</span>
                    <span className={`font-black text-base ${item.highlight ? 'text-blue-700' : 'text-slate-900'}`}>
                      {item.range ? formatRange(item.range[0], item.range[1]) : formatPrice(item.min!, true)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div id="pricing-vm" className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm scroll-mt-28">
              <h3 className="text-xl lg:text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                <span className="text-2xl">🖥️</span> Virtual Machine Setup
              </h3>
              <p className="text-[10px] text-blue-600 mb-8 uppercase tracking-widest font-bold">(On Physical System)</p>
              <div className="space-y-5 text-sm font-medium">
                {[
                  { label: 'Basic (Single VM)', range: [5000, 12000] },
                  { label: 'Standard (Multiple VMs + Network)', range: [12000, 30000], highlight: true },
                  { label: 'Enterprise (Advanced Environment)', min: 30000 },
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between ${idx !== 2 ? 'border-b border-slate-100 pb-4' : 'pt-1'}`}>
                    <span className="text-slate-700">{item.label}</span>
                    <span className={`font-black text-base ${item.highlight ? 'text-blue-700' : 'text-slate-900'}`}>
                      {item.range ? formatRange(item.range[0], item.range[1]) : formatPrice(item.min!, true)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div id="pricing-cloud" className="pricing-card bg-gradient-to-br from-slate-900 to-slate-800 border-transparent rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl scroll-mt-28">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_50%)]"></div>
              <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-black mb-2 flex items-center gap-3">
                  <span className="text-3xl">☁️</span> Cloud VM Setup
                </h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">(As Per Requirement)</p>
                <div className="text-3xl lg:text-4xl font-black text-cyan-400 mb-8">
                  Starting from {formatPrice(10000)}
                </div>
                <ul className="space-y-4 text-slate-300 font-medium text-sm">
                  <li className="flex items-center gap-3"><span className="text-cyan-400">✓</span> Custom VM deployment</li>
                  <li className="flex items-center gap-3"><span className="text-cyan-400">✓</span> Scaling as per requirement</li>
                  <li className="flex items-center gap-3"><span className="text-cyan-400">✓</span> Security + monitoring</li>
                </ul>
              </div>
            </div>
            <div id="pricing-web" className="pricing-card bg-gradient-to-br from-blue-900 to-indigo-900 border-transparent rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl scroll-mt-28">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_60%)]"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                  <span className="text-3xl">🌐</span> Premium Static Website
                </h3>
                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-10">+ Basic AI Chatbot Included</p>
                
                <div className="space-y-6 text-sm font-medium">
                  {[
                    { label: 'Starter (Static + bot)', range: [10000, 20000] },
                    { label: 'Business (Premium + forms)', range: [20000, 50000] },
                    { label: 'Premium (Advanced)', min: 50000 },
                  ].map((item, idx) => (
                    <div key={idx} className={`flex justify-between ${idx !== 2 ? 'border-b border-white/10 pb-4' : 'pt-1'}`}>
                      <span className="text-blue-100">{item.label}</span>
                      <span className="font-black text-white text-lg">
                        {item.range ? formatRange(item.range[0], item.range[1]) : formatPrice(item.min!, true)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-20">
            <div className="inline-block p-[2px] rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl">
              <div className="bg-white text-slate-900 px-10 py-6 rounded-full font-bold text-lg border border-white">
                🔥 <span className="text-blue-700 font-black">HIGHLY RECOMMENDED:</span> <span className="text-slate-600">"Contact us for a customized solution and best quote based on your business needs."</span>
                <br />
                <a href="#contact" className="mt-6 inline-block bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md">
                  Get Custom Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
