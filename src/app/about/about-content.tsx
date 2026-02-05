'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const sections = [
  {
    title: 'Our Mission & Vision',
    content: 'At KN Biosciences, our mission is to empower farmers and aquaculture professionals with innovative, biological solutions that enhance productivity while preserving the environment. Our vision is to be the global leader in sustainable agriculture, driving a greener future for generations to come.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=800',
    reverse: false,
  },
  {
    title: 'Our Story',
    content: 'Founded with a passion for sustainable farming, KN Biosciences has grown from a small research laboratory into a comprehensive e-commerce platform and product developer. Our journey is defined by a commitment to scientific excellence and a deep understanding of the challenges faced by the agricultural community.',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800',
    reverse: true,
  },
  {
    title: 'Impact & Sustainability',
    content: 'We believe that profit and planet can coexist. Our products are designed to reduce chemical dependency, improve soil health, and promote biodiversity. We measure our success not just in sales, but in the positive environmental impact we create across millions of acres of farmland.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800',
    reverse: false,
  },
];

const team = [
  {
    name: 'Dr. Karuna Nimishakavi',
    role: 'Founder & CEO',
    bio: 'A visionary in biological agriculture with over 20 years of research experience.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Nimishakavi Srinivas',
    role: 'Managing Director',
    bio: 'Strategic leader focused on operational excellence and global expansion.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
  },
];

export default function AboutPage() {
  const headerRef = useRef(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
      });

      // Sections animation
      sectionsRef.current.forEach((section) => {
        if (section) {
          gsap.from(section, {
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out',
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-background pb-16">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-[#795548] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200"
            alt="About KN Biosciences"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container relative z-10 text-center" ref={headerRef}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Nurturing Nature with Science
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Pioneering biological solutions for a sustainable agricultural future.
          </p>
        </div>
      </section>

      {/* Main Sections */}
      <div className="container py-16 space-y-24">
        {sections.map((section, index) => (
          <div 
            key={index}
            ref={(el) => (sectionsRef.current[index] = el)}
            className={`flex flex-col ${section.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}
          >
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-[#795548]">{section.title}</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </div>
            <div className="flex-1 relative h-[350px] w-full rounded-2xl overflow-hidden shadow-xl bg-muted">
              <Image
                src={section.image}
                alt={section.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Team Section */}
      <section className="bg-muted py-16">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#795548] mb-4">Our Leadership</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the minds behind our innovation and commitment to excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-card p-8 rounded-2xl shadow-md text-center border border-border hover:shadow-lg transition-shadow"
              >
                <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#8BC34A]/20">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-[#8BC34A] font-medium mb-4">{member.role}</p>
                <p className="text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="container py-16 text-center">
        <h2 className="text-3xl font-bold text-[#795548] mb-12">Our Certifications</h2>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
           <div className="px-6 py-3 bg-muted rounded-lg font-bold text-xl border border-border">ISO 9001:2015</div>
           <div className="px-6 py-3 bg-muted rounded-lg font-bold text-xl border border-border">NPOP Organic</div>
           <div className="px-6 py-3 bg-muted rounded-lg font-bold text-xl border border-border">GMP Certified</div>
           <div className="px-6 py-3 bg-muted rounded-lg font-bold text-xl border border-border">FSSAI</div>
        </div>
      </section>
    </div>
  );
}
