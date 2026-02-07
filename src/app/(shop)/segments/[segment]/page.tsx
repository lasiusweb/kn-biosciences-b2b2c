import { Metadata } from 'next'
import SegmentHubLayout from '@/components/segment-ui/segment-hub-layout'

interface SegmentPageProps {
  params: {
    segment: string
  }
}

export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata> {
  const { segment } = params
  const segmentName = segment.charAt(0).toUpperCase() + segment.slice(1)
  
  return {
    title: `${segmentName} Agricultural Solutions | KN Biosciences`,
    description: `Premium agricultural products and solutions for ${segment} crops. Expert recommendations, comprehensive guides, and innovative farming solutions.`,
    openGraph: {
      title: `${segmentName} Solutions | KN Biosciences`,
      description: `Discover premium agricultural solutions for ${segment} crops`,
      type: 'website',
    },
  }
}

export default function SegmentPage({ params }: SegmentPageProps) {
  const { segment } = params
  
  return (
    <main>
      <SegmentHubLayout segment={segment} />
    </main>
  )
}