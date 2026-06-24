import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export const metadata = {
  title: 'Our Real Estate Agents | Luxury Properties Ltd',
  description: 'Meet our team of expert real estate agents in Lagos, Nigeria. Professional, experienced, and dedicated to finding your perfect property.',
  alternates: { canonical: '/agents' },
};

export default function AgentsPage() {
  const agents = [
    { name: 'Agene Sunday', role: 'CEO & Founder', bio: '15+ years in luxury real estate' },
    { name: 'Sarah Johnson', role: 'Senior Agent', bio: 'Specializes in Ikoyi and Victoria Island' },
    { name: 'Michael Chen', role: 'Property Consultant', bio: 'Expert in off-market properties' },
    { name: 'Amara Okonkwo', role: 'Client Relations', bio: 'Dedicated to diaspora clients' },
  ];

  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[50vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 text-white">Our Agents</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Meet the team dedicated to finding your perfect property
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {agents.map((agent, i) => (
                <div key={i} className="bg-card p-6 rounded-2xl text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary">{agent.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                  <p className="text-gold-primary text-sm mb-2">{agent.role}</p>
                  <p className="text-muted-foreground text-sm">{agent.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}