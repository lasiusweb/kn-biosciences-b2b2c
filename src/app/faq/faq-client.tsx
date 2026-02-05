'use client';

import React, { useState, useMemo } from 'react';
import { FAQ } from '@/lib/cms-service';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { gsap } from 'gsap';

interface FAQClientProps {
  faqs: FAQ[];
}

export default function FAQClient({ faqs }: FAQClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [faqs, searchQuery]);

  const groupedFAQs = useMemo(() => {
    const groups: { [key: string]: FAQ[] } = {};
    filteredFAQs.forEach((faq) => {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }
      groups[faq.category].push(faq);
    });
    return groups;
  }, [filteredFAQs]);

  const categories = Object.keys(groupedFAQs);

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-[#795548]">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about our products, shipping, and more.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-12 max-w-xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Search for answers..."
          className="pl-10 h-12 text-lg rounded-full shadow-sm border-2 border-muted focus:border-[#8BC34A]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FAQs */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-muted-foreground">
            No FAQs found matching "{searchQuery}"
          </h3>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-4 text-[#8BC34A] hover:underline font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category} className="space-y-6">
              <h2 className="text-2xl font-bold text-[#795548] border-b pb-2 border-[#8BC34A]/20">
                {category}
              </h2>
              <div className="grid gap-4">
                {groupedFAQs[category].map((faq) => (
                  <Card 
                    key={faq.id} 
                    className="overflow-hidden transition-all duration-200 border-none shadow-md hover:shadow-lg"
                  >
                    <div
                      className={`
                        p-6 cursor-pointer flex justify-between items-center bg-white
                        ${expandedId === faq.id ? 'bg-muted/30' : ''}
                      `}
                      onClick={() => toggleAccordion(faq.id)}
                    >
                      <h3 className="text-lg font-medium text-foreground pr-8">
                        {faq.question}
                      </h3>
                      {expandedId === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-[#8BC34A] shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    {expandedId === faq.id && (
                      <CardContent className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="pt-4 border-t border-border/50">
                           {faq.answer}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Contact Support CTA */}
      <div className="mt-16 text-center bg-[#8BC34A]/10 p-8 rounded-2xl">
        <h3 className="text-xl font-bold mb-2 text-[#795548]">Still have questions?</h3>
        <p className="text-muted-foreground mb-6">
          Can't find the answer you're looking for? Our team is here to help.
        </p>
        <a 
          href="/contact" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#8BC34A] hover:bg-[#7cb342] transition-colors shadow-sm"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
