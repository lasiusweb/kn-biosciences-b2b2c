import { Metadata } from 'next'
import CropDiscoveryFunnel from '@/components/discovery/crop-discovery-funnel'

export const metadata: Metadata = {
  title: 'Crop Discovery Assistant | KN Biosciences',
  description: 'Personalized crop discovery and solution recommendations. Find the perfect products for your farming needs.',
  openGraph: {
    title: 'Crop Discovery Assistant | KN Biosciences',
    description: 'Get personalized agricultural recommendations',
    type: 'website',
  },
}

interface DiscoveryPageProps {
  params: {
    segment: string
  }
}

export default function DiscoveryPage({ params }: DiscoveryPageProps) {
  const { segment } = params
  
  return (
    <main>
      <CropDiscoveryFunnel segment={segment} />
    </main>
  )
}