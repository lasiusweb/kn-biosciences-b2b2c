import React from 'react';
import { Metadata } from 'next';
import { cmsService } from '@/lib/cms-service';
import FAQClient from './faq-client';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | KN Biosciences',
  description: 'Find answers to common questions about our biological agricultural products, shipping, payments, and returns.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function FAQPage() {
  const faqs = await cmsService.getFAQs();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQClient faqs={faqs} />
    </div>
  );
}