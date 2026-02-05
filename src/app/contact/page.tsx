import React from 'react';
import { Metadata } from 'next';
import ContactContent from './contact-content';

export const metadata: Metadata = {
  title: 'Contact Us | KN Biosciences',
  description: 'Get in touch with KN Biosciences. Reach out for product inquiries, support, or partnership opportunities. We are here to help.',
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact KN Biosciences',
    mainEntity: {
      '@type': 'Organization',
      name: 'KN Biosciences',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91 40 1234 5678',
        contactType: 'customer service',
        email: 'info@knbiosciences.in',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi', 'te'],
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Plot No. 123, Bio-Tech Park, Phase-II',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        postalCode: '500078',
        addressCountry: 'IN',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactContent />
    </>
  );
}
