import React from 'react';

interface PolicyLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-organic-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-earth-900 mb-4">{title}</h1>
          {lastUpdated && (
            <p className="text-earth-600">Last updated: {lastUpdated}</p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto prose prose-earth prose-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
