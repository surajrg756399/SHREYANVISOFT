import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import HighDemand from './components/HighDemand';
import FutureTech from './components/FutureTech';
import AIPlayground from './components/AIPlayground';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import WhyUs from './components/WhyUs';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import AdminDashboard from './components/AdminDashboard';
import ClientPortal from './components/ClientPortal';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentPath === '#admin') {
    return <AdminDashboard />;
  }

  if (currentPath === '#client') {
    return <ClientPortal />;
  }

  return (
    <div className="text-slate-800 selection:bg-blue-500/20 selection:text-blue-900 relative min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <HighDemand />
        <FutureTech />
        <AIPlayground />
        <Pricing />
        <FAQ />
        <WhyUs />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
