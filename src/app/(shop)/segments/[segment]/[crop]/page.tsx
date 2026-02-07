import { Metadata } from 'next'
import CropEnvironmentView from '@/components/discovery/crop-environment-view'

export const metadata: Metadata = {
  title: 'Crop Environment & Solutions | KN Biosciences',
  description: 'Dynamic crop environment monitoring and personalized agricultural solutions with real-time recommendations.',
  openGraph: {
    title: 'Crop Environment & Solutions | KN Biosciences',
    description: 'Real-time crop monitoring and solutions',
    type: 'website',
  },
}

interface CropViewPageProps {
  params: {
    segment: string
    crop: string
  }
}

export default function CropViewPage({ params }: CropViewPageProps) {
  const { segment, crop } = params
  
  return (
    <main>
      <CropEnvironmentView crop={crop} segment={segment} />
    </main>
  )
}