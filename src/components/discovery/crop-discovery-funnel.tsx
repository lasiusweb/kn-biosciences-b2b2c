'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  ChevronRight, 
  ChevronLeft, 
  Filter, 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Info,
  Leaf,
  Droplet,
  Sun
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface DiscoveryStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  completed: boolean
  icon: React.ReactNode
}

interface CropProblem {
  id: string
  name: string
  category: 'pests' | 'diseases' | 'nutrition' | 'environmental'
  severity: 'low' | 'medium' | 'high'
  symptoms: string[]
  solutions: Array<{
    id: string
    name: string
    type: 'product' | 'practice'
    price?: number
  }>
}

interface RegionData {
  id: string
  name: string
  climate: string
  soil_type: string
  popular_crops: string[]
  best_practices: string[]
}

interface CropDiscoveryFunnelProps {
  segment: string
  className?: string
}

export function CropDiscoveryFunnel({ segment, className }: CropDiscoveryFunnelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedCrop, setSelectedCrop] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [identifiedProblems, setIdentifiedProblems] = useState<CropProblem[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const discoverySteps: DiscoveryStep[] = [
    {
      id: 'crop-selection',
      title: 'Select Your Crop',
      description: 'Choose the crop you\'re cultivating to get personalized recommendations',
      completed: selectedCrop !== '',
      icon: <Leaf className="w-6 h-6" />,
      component: CropSelectionStep
    },
    {
      id: 'region-selection',
      title: 'Growing Region',
      description: 'Tell us about your farming region for localized advice',
      completed: selectedRegion !== '',
      icon: <MapPin className="w-6 h-6" />,
      component: RegionSelectionStep
    },
    {
      id: 'problem-identification',
      title: 'Identify Challenges',
      description: 'Select the problems you\'re facing with your crop',
      completed: identifiedProblems.length > 0,
      icon: <AlertCircle className="w-6 h-6" />,
      component: ProblemIdentificationStep
    },
    {
      id: 'recommendations',
      title: 'Get Recommendations',
      description: 'Receive personalized product and practice recommendations',
      completed: recommendedProducts.length > 0,
      icon: <CheckCircle className="w-6 h-6" />,
      component: RecommendationsStep
    }
  ]

  useEffect(() => {
    if (!containerRef.current) return

    // Step indicator animations
    const indicators = containerRef.current.querySelectorAll('.step-indicator')
    indicators.forEach((indicator, index) => {
      gsap.fromTo(indicator,
        { scale: 0, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.4,
          delay: index * 0.1,
          ease: 'back.out(1.7)'
        }
      )
    })

    // Content animations
    const contentPanels = containerRef.current.querySelectorAll('.step-content')
    gsap.fromTo(contentPanels,
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: contentPanels[0],
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [currentStep])

  const nextStep = () => {
    if (currentStep < discoverySteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = discoverySteps[currentStep].component

  return (
    <div ref={containerRef} className={cn('min-h-screen bg-gradient-to-b from-green-50 to-white', className)}>
      {/* Progress Indicator */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-earth-900">
              Crop Discovery Assistant
            </h2>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {discoverySteps.length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            {discoverySteps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'step-indicator flex-1 flex flex-col items-center px-4 py-2 border-b-2 transition-colors',
                  {
                    'border-organic-500': index <= currentStep,
                    'border-gray-200': index > currentStep
                  }
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors',
                  {
                    'bg-organic-500 text-white': step.completed,
                    'bg-gray-200 text-gray-500': !step.completed && index > currentStep,
                    'bg-organic-100 text-organic-600 border-2 border-organic-500': index === currentStep && !step.completed
                  }
                )}>
                  {step.icon}
                </div>
                <span className={cn(
                  'text-xs font-medium text-center transition-colors',
                  {
                    'text-organic-600': index <= currentStep,
                    'text-gray-400': index > currentStep
                  }
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="step-content bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-earth-900 mb-2">
                  {discoverySteps[currentStep].title}
                </h3>
                <p className="text-gray-600">
                  {discoverySteps[currentStep].description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!discoverySteps[currentStep].completed}
                  className="flex items-center"
                >
                  {currentStep === discoverySteps.length - 1 ? 'View Results' : 'Next Step'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            <CurrentStepComponent
              segment={segment}
              selectedCrop={selectedCrop}
              setSelectedCrop={setSelectedCrop}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              identifiedProblems={identifiedProblems}
              setIdentifiedProblems={setIdentifiedProblems}
              recommendedProducts={recommendedProducts}
              setRecommendedProducts={setRecommendedProducts}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components
function CropSelectionStep({ 
  segment, 
  selectedCrop, 
  setSelectedCrop,
  loading 
}: any) {
  const crops = [
    { id: 'wheat', name: 'Wheat', season: 'Rabi', description: 'Major cereal crop for northern regions' },
    { id: 'rice', name: 'Rice', season: 'Kharif', description: 'Staple food crop requiring water management' },
    { id: 'maize', name: 'Maize', season: 'Both', description: 'Versatile crop for food and industrial use' },
    { id: 'cotton', name: 'Cotton', season: 'Kharif', description: 'Fiber crop with high market value' },
    { id: 'pulses', name: 'Pulses', season: 'Rabi', description: 'Protein-rich crops for sustainable agriculture' },
    { id: 'vegetables', name: 'Vegetables', season: 'Year-round', description: 'High-value horticultural crops' }
  ].filter(crop => segment === 'cereals' ? ['wheat', 'rice', 'maize'].some(id => id === crop.id) : true)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.map((crop) => (
          <div
            key={crop.id}
            onClick={() => !loading && setSelectedCrop(crop.id)}
            className={cn(
              'p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg',
              {
                'border-organic-500 bg-organic-50': selectedCrop === crop.id,
                'border-gray-200 hover:border-organic-300': selectedCrop !== crop.id
              }
            )}
          >
            <div className="flex items-center mb-3">
              <Leaf className="w-8 h-8 text-organic-500 mr-3" />
              <div>
                <h4 className="text-lg font-semibold text-earth-900">{crop.name}</h4>
                <span className="text-sm text-gray-500">{crop.season} crop</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{crop.description}</p>
          </div>
        ))}
      </div>

      {!selectedCrop && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Selected: {crops.find(c => c.id === selectedCrop)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function RegionSelectionStep({ 
  selectedRegion, 
  setSelectedRegion,
  loading 
}: any) {
  const regions = [
    {
      id: 'north',
      name: 'North India',
      climate: 'Continental',
      soil_type: 'Alluvial',
      popular_crops: ['Wheat', 'Rice', 'Maize'],
      best_practices: ['Timely sowing', 'Proper irrigation', 'Balanced fertilization']
    },
    {
      id: 'south',
      name: 'South India',
      climate: 'Tropical',
      soil_type: 'Red lateritic',
      popular_crops: ['Rice', 'Millets', 'Pulses'],
      best_practices: ['Monsoon preparation', 'Crop rotation', 'Organic matter']
    },
    {
      id: 'east',
      name: 'East India',
      climate: 'Tropical monsoon',
      soil_type: 'Delta alluvial',
      popular_crops: ['Rice', 'Jute', 'Sugarcane'],
      best_practices: ['Flood management', 'High yielding varieties']
    },
    {
      id: 'west',
      name: 'West India',
      climate: 'Arid to semi-arid',
      soil_type: 'Black cotton',
      popular_crops: ['Cotton', 'Millets', 'Pulses'],
      best_practices: ['Water conservation', 'Drought resistant varieties']
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((region) => (
          <div
            key={region.id}
            onClick={() => !loading && setSelectedRegion(region.id)}
            className={cn(
              'p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg',
              {
                'border-organic-500 bg-organic-50': selectedRegion === region.id,
                'border-gray-200 hover:border-organic-300': selectedRegion !== region.id
              }
            )}
          >
            <div className="flex items-center mb-3">
              <MapPin className="w-8 h-8 text-organic-500 mr-3" />
              <div>
                <h4 className="text-lg font-semibold text-earth-900">{region.name}</h4>
                <span className="text-sm text-gray-500">{region.climate} climate</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Soil Type:</strong> {region.soil_type}</div>
              <div><strong>Popular Crops:</strong> {region.popular_crops.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedRegion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Region: {regions.find(r => r.id === selectedRegion)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function ProblemIdentificationStep({ 
  identifiedProblems, 
  setIdentifiedProblems,
  loading 
}: any) {
  const problems: CropProblem[] = [
    {
      id: 'pest-attack',
      name: 'Pest Attack',
      category: 'pests',
      severity: 'high',
      symptoms: ['Leaf damage', 'Stunted growth', 'Yield loss'],
      solutions: [
        { id: 'pesticide-1', name: 'Organic Pesticide', type: 'product', price: 450 },
        { id: 'ipm-1', name: 'Integrated Pest Management', type: 'practice' }
      ]
    },
    {
      id: 'fungal-infection',
      name: 'Fungal Infection',
      category: 'diseases',
      severity: 'medium',
      symptoms: ['Spots on leaves', 'Yellowing', 'Wilting'],
      solutions: [
        { id: 'fungicide-1', name: 'Broad-spectrum Fungicide', type: 'product', price: 380 },
        { id: 'crop-rotation', name: 'Crop Rotation', type: 'practice' }
      ]
    },
    {
      id: 'nutrient-deficiency',
      name: 'Nutrient Deficiency',
      category: 'nutrition',
      severity: 'medium',
      symptoms: ['Yellow leaves', 'Poor growth', 'Low yield'],
      solutions: [
        { id: 'fertilizer-1', name: 'Balanced NPK Fertilizer', type: 'product', price: 520 },
        { id: 'soil-test', name: 'Soil Testing', type: 'practice' }
      ]
    },
    {
      id: 'water-stress',
      name: 'Water Stress',
      category: 'environmental',
      severity: 'high',
      symptoms: ['Drought stress', 'Leaf rolling', 'Poor pollination'],
      solutions: [
        { id: 'drip-irrigation', name: 'Drip Irrigation System', type: 'product', price: 2500 },
        { id: 'mulching', name: 'Mulching Practice', type: 'practice' }
      ]
    }
  ]

  const toggleProblem = (problemId: string) => {
    if (loading) return
    
    const isSelected = identifiedProblems.some(p => p.id === problemId)
    if (isSelected) {
      setIdentifiedProblems(identifiedProblems.filter(p => p.id !== problemId))
    } else {
      setIdentifiedProblems([...identifiedProblems, problems.find(p => p.id === problemId)!])
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pests': return <AlertCircle className="w-5 h-5" />
      case 'diseases': return <Info className="w-5 h-5" />
      case 'nutrition': return <Leaf className="w-5 h-5" />
      case 'environmental': return <Droplet className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-earth-900 mb-2">
          Select the problems you're experiencing
        </h4>
        <p className="text-gray-600">
          Choose all that apply to get comprehensive recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {problems.map((problem) => (
          <div
            key={problem.id}
            onClick={() => toggleProblem(problem.id)}
            className={cn(
              'p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg',
              {
                'border-organic-500 bg-organic-50': identifiedProblems.some(p => p.id === problem.id),
                'border-gray-200 hover:border-organic-300': !identifiedProblems.some(p => p.id === problem.id)
              }
            )}
          >
            <div className="flex items-start space-x-3">
              <div className={cn(
                'p-2 rounded-lg',
                getSeverityColor(problem.severity)
              )}>
                {getCategoryIcon(problem.category)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-earth-900">{problem.name}</h5>
                  <div className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getSeverityColor(problem.severity)
                  )}>
                    {problem.severity} severity
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Common symptoms:</strong> {problem.symptoms.join(', ')}
                </div>
                <div className="text-sm text-gray-500">
                  {problem.solutions.length} solutions available
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {identifiedProblems.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              {identifiedProblems.length} problem{identifiedProblems.length > 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function RecommendationsStep({ 
  recommendedProducts, 
  loading 
}: any) {
  if (recommendedProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <Sun className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">
          Complete the previous steps to receive personalized recommendations
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-2xl font-bold text-earth-900 mb-2">
          Your Personalized Recommendations
        </h4>
        <p className="text-gray-600">
          Based on your selections, here are the best solutions for your farm
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedProducts.map((product: any, index) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-video bg-gray-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold text-gray-400">
                  {index + 1}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-lg font-semibold text-earth-900">{product.name}</h5>
                <span className="bg-organic-500 text-white px-3 py-1 rounded-full text-sm">
                  {product.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {product.description}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-organic-600">
                  ₹{product.price || '999'}
                </div>
                <Button className="bg-organic-500 hover:bg-organic-600">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CropDiscoveryFunnel