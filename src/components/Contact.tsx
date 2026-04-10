import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

export default function Contact() {
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [iti, setIti] = useState<any>(null);
  const [phoneError, setPhoneError] = useState(false);
  const [formStatus, setFormStatus] = useState('100% Secure. Sent directly to sales@shreyanvisoft.com.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (phoneInputRef.current) {
      const instance = intlTelInput(phoneInputRef.current, {
        initialCountry: "in",
        separateDialCode: true,
        strictMode: false,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.4/build/js/utils.js"
      } as any);
      setIti(instance);
      return () => instance.destroy();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhoneError(false);

    if (iti) {
      // Very permissive validation: just check if there are at least 8 digits
      const rawValue = phoneInputRef.current?.value.replace(/\D/g, '') || '';
      if (rawValue.length < 8) {
        setPhoneError(true);
        phoneInputRef.current?.focus();
        return;
      }
    }

    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (iti) {
      formData.set('phone', iti.getNumber());
    }
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        }
      });
      if (response.ok) {
        form.reset();
        setFormStatus('Order Received Successfully!');
        setTimeout(() => setFormStatus('100% Secure. Sent directly to sales@shreyanvisoft.com.'), 5000);
      } else {
        const errData = await response.json() as any;
        throw new Error(errData.error || 'Failed to send');
      }
    } catch (error: any) {
      setFormStatus('Heavy traffic detected. Please email sales@shreyanvisoft.com directly for immediate assistance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-gradient-to-b from-transparent to-white/60 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-700 font-bold tracking-[0.2em] uppercase text-[10px] bg-blue-50 px-5 py-2.5 rounded-full inline-block mb-6 border border-blue-100 shadow-sm">Start Your Journey</span>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight">Let's Build & Secure It.</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Fill out the form below for a custom quote, or reach our executive team directly at <a href="mailto:sales@shreyanvisoft.com" className="text-blue-600 font-bold hover:text-blue-800 transition-colors border-b-2 border-blue-200 hover:border-blue-600 pb-0.5">sales@shreyanvisoft.com</a>
          </p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="dynamic-form" 
          action={import.meta.env.VITE_FORMSPREE_URL || "https://formspree.io/f/mnjoopbq"} 
          method="POST" 
          onSubmit={handleSubmit}
          className="premium-panel p-8 md:p-14 rounded-[3rem] space-y-8 relative overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-widest">Full Name</label>
              <input type="text" name="name" required className="field-bg w-full px-5 py-4 rounded-2xl text-slate-800 font-bold" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-widest">Email Address</label>
              <input type="email" name="email" required className="field-bg w-full px-5 py-4 rounded-2xl text-slate-800 font-bold" placeholder="john@company.com" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-widest">Phone Number</label>
              <div className="w-full">
                <input ref={phoneInputRef} type="tel" name="phone" className="field-bg w-full px-5 py-4 rounded-2xl text-slate-800 font-bold" required />
              </div>
              {phoneError && (
                <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-widest">Please enter a valid phone number for the selected country.</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-widest">Service Required</label>
              <select name="service" required className="field-bg w-full px-5 py-4 rounded-2xl text-slate-800 font-bold cursor-pointer">
                <option value="Tenant Setup & Email Migration">Tenant Setup & Email Migration</option>
                <option value="Azure Site Recovery & Backup Replication">Azure Site Recovery & Backup Replication</option>
                <option value="Physical & Virtual Server Setup">Physical & Virtual Server Setup</option>
                <option value="Global Web-Based Remote Access">Global Web-Based Remote Access</option>
                <option value="Premium Static Website Design">Premium Static Website Design</option>
                <option value="AI Chat Bot Integration">AI Chat Bot Integration</option>
                <option value="Other">Other Custom Solutions</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-widest">Project Details</label>
              <textarea name="details" rows={5} required className="field-bg w-full p-5 rounded-2xl text-slate-800 resize-none font-bold" placeholder="Tell us about your requirements..."></textarea>
            </div>
            
            <div className="md:col-span-2 flex justify-center">
              {/* Cloudflare Turnstile Widget */}
              <div className="cf-turnstile" data-sitekey="1x00000000000000000000AA" data-theme="light"></div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`premium-button w-full text-white font-black text-sm uppercase tracking-[0.2em] py-6 rounded-2xl relative z-10 disabled:opacity-50 ${formStatus.includes('Successfully') ? 'bg-green-600' : ''}`}
          >
            {isSubmitting ? 'Processing...' : (formStatus.includes('Successfully') ? 'Order Received Successfully!' : 'Place Order Request')}
          </button>
          <p className="text-[10px] font-bold text-slate-500 text-center mt-6 relative z-10 uppercase tracking-[0.2em]">
            {formStatus}
          </p>
        </motion.form>
      </div>
    </section>
  );
}
