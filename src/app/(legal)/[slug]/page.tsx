import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cmsService } from '@/lib/cms-service';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate valid static params
export async function generateStaticParams() {
  return [
    { slug: 'privacy-policy' },
    { slug: 'terms-and-conditions' },
    { slug: 'refund-policy' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const content = await cmsService.getLegalContent(params.slug);

  if (!content) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${content.title} | KN Biosciences`,
  };
}

export const revalidate = 3600;

export default async function LegalPage({ params }: PageProps) {
  const content = await cmsService.getLegalContent(params.slug);

  if (!content) {
    notFound();
  }

  return (
    <article className="prose prose-stone lg:prose-lg dark:prose-invert max-w-none">
      <h1 className="text-3xl md:text-4xl font-bold text-[#795548] mb-4">
        {content.title}
      </h1>
      <div className="flex items-center text-sm text-muted-foreground mb-8 border-b pb-4">
        <span>Version {content.version}</span>
        <span className="mx-2">•</span>
        <span>Last Updated: {new Date(content.last_updated).toLocaleDateString()}</span>
      </div>
      <div 
        dangerouslySetInnerHTML={{ __html: content.content }} 
        className="[&>h2]:text-[#795548] [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4"
      />
    </article>
  );
}
