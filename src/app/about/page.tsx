import React from 'react';
import { Metadata } from 'next';
import AboutContent from './about-content';

export const metadata: Metadata = {
  title: 'About Us | KN Biosciences',
  description: 'Learn about KN Biosciences, our mission to provide sustainable biological solutions for agriculture, and our commitment to a greener future.',
  openGraph: {
    title: 'About KN Biosciences | Nurturing Nature with Science',
    description: 'Pioneering biological solutions for a sustainable agricultural future since 1997.',
    images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200'],
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About KN Biosciences',
    description: 'Information about KN Biosciences, our mission, story, and leadership team.',
    publisher: {
      '@type': 'Organization',
      name: 'KN Biosciences',
      logo: {
        '@type': 'ImageObject',
        url: 'https://knbiosciences.in/logo.png', // Replace with actual logo URL
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutContent />
    </>
  );
}
