// components/discovery/enhanced-product-discovery.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  Droplets, 
  Sun, 
  MapPin, 
  Wrench, 
  ShoppingCart, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Search,
  Filter,
  Info,
  AlertTriangle,
  Lightbulb,
  Users,
  TrendingUp,
  Shield,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscoveryStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<DiscoveryStepProps>;
  completed: boolean;
}

interface Crop {
  id: string;
  name: string;
  category: string;
  season: string;
  description: string;
  image?: string;
}

interface Problem {
  id: string;
  name: string;
  category: 'pests' | 'diseases' | 'nutrition' | 'environmental' | 'growth';
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  solutions: Solution[];
}

interface Solution {
  id: string;
  name: string;
  type: 'product' | 'practice' | 'consultation';
  description: string;
  price?: number;
  rating?: number;
  image?: string;
}

interface Recommendation {
  id: string;
  name: string;
  type: 'product' | 'practice' | 'consultation';
  description: string;
  price?: number;
  rating?: number;
  image?: string;
  relevanceScore: number;
  whyRecommended: string;
}

interface DiscoveryStepProps {
  onNext: () => void;
  onPrev: () => void;
  onComplete: (data: any) => void;
  currentData: any;
}

interface DiscoveryState {
  selectedSegment: string | null;
  selectedCrop: string | null;
  selectedRegion: string | null;
  identifiedProblems: string[];
  selectedSolutions: string[];
  recommendations: Recommendation[];
}

const segments = [
  { id: 'agriculture', name: 'Agriculture', icon: <Leaf className="w-6 h-6" /> },
  { id: 'aquaculture', name: 'Aquaculture', icon: <Droplets className="w-6 h-6" /> },
  { id: 'poultry', name: 'Poultry Healthcare', icon: <Wrench className="w-6 h-6" /> },
  { id: 'animal', name: 'Animal Healthcare', icon: <Wrench className="w-6 h-6" /> },
  { id: 'bioremediation', name: 'Bioremediation', icon: <Shield className="w-6 h-6" /> },
  { id: 'seeds', name: 'Seeds', icon: <Award className="w-6 h-6" /> },
  { id: 'organic', name: 'Organic Farming', icon: <Leaf className="w-6 h-6" /> },
  { id: 'equipment', name: 'Farm Equipment', icon: <Wrench className="w-6 h-6" /> },
];

const crops: Crop[] = [
  { id: 'wheat', name: 'Wheat', category: 'cereals', season: 'Rabi', description: 'Major cereal crop for northern regions' },
  { id: 'rice', name: 'Rice', category: 'cereals', season: 'Kharif', description: 'Staple food crop requiring water management' },
  { id: 'maize', name: 'Maize', category: 'cereals', season: 'Both', description: 'Versatile crop for food and industrial use' },
  { id: 'cotton', name: 'Cotton', category: 'fiber', season: 'Kharif', description: 'Fiber crop with high market value' },
  { id: 'pulses', name: 'Pulses', category: 'legumes', season: 'Rabi', description: 'Protein-rich crops for sustainable agriculture' },
  { id: 'vegetables', name: 'Vegetables', category: 'horticulture', season: 'Year-round', description: 'High-value horticultural crops' },
  { id: 'fruits', name: 'Fruits', category: 'horticulture', season: 'Year-round', description: 'Nutritious and profitable crops' },
  { id: 'sugarcane', name: 'Sugarcane', category: 'cash', season: 'Kharif', description: 'High-value sugar crop' },
  { id: 'oilseeds', name: 'Oilseeds', category: 'cash', season: 'Both', description: 'Oil-producing crops' },
  { id: 'spices', name: 'Spices', category: 'cash', season: 'Year-round', description: 'High-value aromatic crops' },
];

const regions = [
  { id: 'north', name: 'North India', climate: 'Continental', soil_type: 'Alluvial', popular_crops: ['Wheat', 'Rice', 'Maize'] },
  { id: 'south', name: 'South India', climate: 'Tropical', soil_type: 'Red lateritic', popular_crops: ['Rice', 'Millets', 'Pulses'] },
  { id: 'east', name: 'East India', climate: 'Tropical monsoon', soil_type: 'Delta alluvial', popular_crops: ['Rice', 'Jute', 'Sugarcane'] },
  { id: 'west', name: 'West India', climate: 'Arid to semi-arid', soil_type: 'Black cotton', popular_crops: ['Cotton', 'Millets', 'Pulses'] },
  { id: 'central', name: 'Central India', climate: 'Subtropical', soil_type: 'Mixed', popular_crops: ['Wheat', 'Soybean', 'Cotton'] },
  { id: 'northeast', name: 'Northeast India', climate: 'Humid subtropical', soil_type: 'Lateritic', popular_crops: ['Rice', 'Tea', 'Spices'] },
];

const problems: Problem[] = [
  {
    id: 'pest-attack',
    name: 'Pest Attack',
    category: 'pests',
    severity: 'high',
    symptoms: ['Leaf damage', 'Stunted growth', 'Yield loss'],
    solutions: [
      { id: 'bio-pesticide', name: 'Bio-Pesticide Solution', type: 'product', description: 'Organic pesticide for pest control', price: 450, rating: 4.5 },
      { id: 'ipm', name: 'Integrated Pest Management', type: 'practice', description: 'Sustainable pest control approach' }
    ]
  },
  {
    id: 'fungal-infection',
    name: 'Fungal Infection',
    category: 'diseases',
    severity: 'medium',
    symptoms: ['Spots on leaves', 'Yellowing', 'Wilting'],
    solutions: [
      { id: 'bio-fungicide', name: 'Bio-Fungicide', type: 'product', description: 'Organic fungicide for disease control', price: 380, rating: 4.2 },
      { id: 'crop-rotation', name: 'Crop Rotation', type: 'practice', description: 'Prevent fungal infections through rotation' }
    ]
  },
  {
    id: 'nutrient-deficiency',
    name: 'Nutrient Deficiency',
    category: 'nutrition',
    severity: 'medium',
    symptoms: ['Yellow leaves', 'Poor growth', 'Low yield'],
    solutions: [
      { id: 'bio-fertilizer', name: 'Bio-Fertilizer', type: 'product', description: 'Organic fertilizer for nutrient replenishment', price: 520, rating: 4.7 },
      { id: 'soil-test', name: 'Soil Testing', type: 'consultation', description: 'Professional soil analysis for deficiency' }
    ]
  },
  {
    id: 'water-stress',
    name: 'Water Stress',
    category: 'environmental',
    severity: 'high',
    symptoms: ['Drought stress', 'Leaf rolling', 'Poor pollination'],
    solutions: [
      { id: 'drip-irrigation', name: 'Drip Irrigation System', type: 'product', description: 'Water-efficient irrigation solution', price: 2500, rating: 4.8 },
      { id: 'mulching', name: 'Mulching Practice', type: 'practice', description: 'Water conservation through mulching' }
    ]
  },
  {
    id: 'growth-retardation',
    name: 'Growth Retardation',
    category: 'growth',
    severity: 'medium',
    symptoms: ['Slow growth', 'Weak stems', 'Delayed maturity'],
    solutions: [
      { id: 'growth-promoter', name: 'Growth Promoter', type: 'product', description: 'Bio-stimulant for enhanced growth', price: 320, rating: 4.3 },
      { id: 'pruning', name: 'Pruning Technique', type: 'practice', description: 'Proper pruning for growth enhancement' }
    ]
  }
];

const steps: DiscoveryStep[] = [
  {
    id: 'segment',
    title: 'Select Your Segment',
    description: 'Choose the agricultural segment you operate in',
    icon: <Leaf className="w-6 h-6" />,
    component: SegmentSelectionStep,
    completed: false
  },
  {
    id: 'crop',
    title: 'Select Your Crop',
    description: 'Choose the crop you\'re cultivating for personalized recommendations',
    icon: <Leaf className="w-6 h-6" />,
    component: CropSelectionStep,
    completed: false
  },
  {
    id: 'region',
    title: 'Growing Region',
    description: 'Tell us about your farming region for localized advice',
    icon: <MapPin className="w-6 h-6" />,
    component: RegionSelectionStep,
    completed: false
  },
  {
    id: 'problems',
    title: 'Identify Challenges',
    description: 'Select the problems you\'re facing with your crop',
    icon: <AlertTriangle className="w-6 h-6" />,
    component: ProblemIdentificationStep,
    completed: false
  },
  {
    id: 'solutions',
    title: 'Choose Solutions',
    description: 'Select the solutions you\'re interested in',
    icon: <Lightbulb className="w-6 h-6" />,
    component: SolutionSelectionStep,
    completed: false
  },
  {
    id: 'recommendations',
    title: 'Get Recommendations',
    description: 'Receive personalized product and practice recommendations',
    icon: <TrendingUp className="w-6 h-6" />,
    component: RecommendationsStep,
    completed: false
  }
];

export function EnhancedProductDiscovery() {
  const [currentStep, setCurrentStep] = useState(0);
  const [discoveryState, setDiscoveryState] = useState<DiscoveryState>({
    selectedSegment: null,
    selectedCrop: null,
    selectedRegion: null,
    identifiedProblems: [],
    selectedSolutions: [],
    recommendations: []
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((currentStep / (steps.length - 1)) * 100);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (stepData: any) => {
    setDiscoveryState(prev => ({
      ...prev,
      ...stepData
    }));
    handleNext();
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-b from-organic-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-earth-900 mb-4">
            Agricultural Product Discovery Assistant
          </h1>
          <p className="text-xl text-earth-600 max-w-3xl mx-auto">
            Get personalized recommendations for bio-fertilizers, pre-probiotics, and sustainable agricultural solutions
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-earth-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-organic-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-organic-100 flex items-center justify-center mb-4">
              {steps[currentStep].icon}
            </div>
            <CardTitle className="text-2xl text-earth-900">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-earth-600">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onComplete={handleComplete}
                  currentData={discoveryState}
                />
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === currentStep 
                    ? "bg-organic-500" 
                    : index < currentStep 
                      ? "bg-green-500" 
                      : "bg-gray-300"
                )}
              />
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="flex items-center bg-organic-500 hover:bg-organic-600"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            {currentStep < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function SegmentSelectionStep({ onNext, onPrev, onComplete, currentData }: DiscoveryStepProps) {
  const [selectedSegment, setSelectedSegment] = useState(currentData.selectedSegment);

  const handleContinue = () => {
    if (selectedSegment) {
      onComplete({ selectedSegment });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {segments.map((segment) => (
          <motion.div
            key={segment.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSegment(segment.id)}
            className={cn(
              "p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center",
              {
                'border-organic-500 bg-organic-50': selectedSegment === segment.id,
                'border-gray-200 hover:border-organic-300': selectedSegment !== segment.id
              }
            )}
          >
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                selectedSegment === segment.id 
                  ? "bg-organic-500 text-white" 
                  : "bg-gray-100 text-earth-600"
              )}>
                {segment.icon}
              </div>
              <h3 className="font-semibold text-earth-900">{segment.name}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!selectedSegment}
          className="bg-organic-500 hover:bg-organic-600"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function CropSelectionStep({ onNext, onPrev, onComplete, currentData }: DiscoveryStepProps) {
  const [selectedCrop, setSelectedCrop] = useState(currentData.selectedCrop);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedCrop) {
      onComplete({ selectedCrop });
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for crops..."
          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-2">
        {filteredCrops.map((crop) => (
          <motion.div
            key={crop.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCrop(crop.id)}
            className={cn(
              "p-6 rounded-xl border-2 cursor-pointer transition-all duration-300",
              {
                'border-organic-500 bg-organic-50': selectedCrop === crop.id,
                'border-gray-200 hover:border-organic-300': selectedCrop !== crop.id
              }
            )}
          >
            <div className="flex items-start space-x-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                selectedCrop === crop.id 
                  ? "bg-organic-500 text-white" 
                  : "bg-gray-100 text-earth-600"
              )}>
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-earth-900">{crop.name}</h3>
                <p className="text-sm text-gray-600">{crop.description}</p>
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className="text-xs mr-2">
                    {crop.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {crop.season}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!selectedCrop}
          className="flex items-center bg-organic-500 hover:bg-organic-600"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function RegionSelectionStep({ onNext, onPrev, onComplete, currentData }: DiscoveryStepProps) {
  const [selectedRegion, setSelectedRegion] = useState(currentData.selectedRegion);

  const handleContinue = () => {
    if (selectedRegion) {
      onComplete({ selectedRegion });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((region) => (
          <motion.div
            key={region.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRegion(region.id)}
            className={cn(
              "p-6 rounded-xl border-2 cursor-pointer transition-all duration-300",
              {
                'border-organic-500 bg-organic-50': selectedRegion === region.id,
                'border-gray-200 hover:border-organic-300': selectedRegion !== region.id
              }
            )}
          >
            <div className="flex items-center mb-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                selectedRegion === region.id 
                  ? "bg-organic-500 text-white" 
                  : "bg-gray-100 text-earth-600"
              )}>
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-earth-900">{region.name}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Climate:</span>
                <span className="font-medium">{region.climate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Soil Type:</span>
                <span className="font-medium">{region.soil_type}</span>
              </div>
              <div>
                <span className="text-gray-600">Popular Crops:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {region.popular_crops.map((crop, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!selectedRegion}
          className="flex items-center bg-organic-500 hover:bg-organic-600"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ProblemIdentificationStep({ onNext, onPrev, onComplete, currentData }: DiscoveryStepProps) {
  const [identifiedProblems, setIdentifiedProblems] = useState<string[]>(currentData.identifiedProblems);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProblems = problems.filter(problem => 
    problem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleProblem = (problemId: string) => {
    if (identifiedProblems.includes(problemId)) {
      setIdentifiedProblems(identifiedProblems.filter(id => id !== problemId));
    } else {
      setIdentifiedProblems([...identifiedProblems, problemId]);
    }
  };

  const handleContinue = () => {
    onComplete({ identifiedProblems });
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for problems or symptoms..."
          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProblems.map((problem) => (
          <motion.div
            key={problem.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleProblem(problem.id)}
            className={cn(
              "p-6 rounded-xl border-2 cursor-pointer transition-all duration-300",
              {
                'border-organic-500 bg-organic-50': identifiedProblems.includes(problem.id),
                'border-gray-200 hover:border-organic-300': !identifiedProblems.includes(problem.id)
              }
            )}
          >
            <div className="flex items-start space-x-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                identifiedProblems.includes(problem.id) 
                  ? "bg-organic-500 text-white" 
                  : "bg-gray-100 text-earth-600"
              )}>
                {problem.category === 'pests' && <AlertTriangle className="w-6 h-6" />}
                {problem.category === 'diseases' && <Info className="w-6 h-6" />}
                {problem.category === 'nutrition' && <Leaf className="w-6 h-6" />}
                {problem.category === 'environmental' && <Droplets className="w-6 h-6" />}
                {problem.category === 'growth' && <TrendingUp className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-earth-900">{problem.name}</h3>
                  <Badge 
                    variant={problem.severity === 'high' ? 'destructive' : problem.severity === 'medium' ? 'default' : 'secondary'}
                    className="text-xs capitalize"
                  >
                    {problem.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Symptoms:</span> {problem.symptoms.join(', ')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {problem.solutions.map((solution, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {solution.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={identifiedProblems.length === 0}
          className="flex items-center bg-organic-500 hover:bg-organic-600"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function SolutionSelectionStep({ onNext, onPrev, onComplete, currentData }: DiscoveryStepProps) {
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>(currentData.selectedSolutions);

  // Get all solutions from identified problems
  const allSolutions = problems
    .filter(problem => currentData.identifiedProblems.includes(problem.id))
    .flatMap(problem => problem.solutions);

  // Remove duplicates
  const uniqueSolutions = Array.from(
    new Map(allSolutions.map(solution => [solution.id, solution])).values()
  );

  const toggleSolution = (solutionId: string) => {
    if (selectedSolutions.includes(solutionId)) {
      setSelectedSolutions(selectedSolutions.filter(id => id !== solutionId));
    } else {
      setSelectedSolutions([...selectedSolutions, solutionId]);
    }
  };

  const handleContinue = () => {
    // Generate recommendations based on selections
    const recommendations: Recommendation[] = uniqueSolutions
      .filter(solution => selectedSolutions.includes(solution.id))
      .map(solution => ({
        id: solution.id,
        name: solution.name,
        type: solution.type,
        description: solution.description,
        price: solution.price,
        rating: solution.rating,
        relevanceScore: Math.random() * 100, // In a real app, this would be calculated based on user selections
        whyRecommended: `This ${solution.type} is recommended based on your identified problems and crop type.`
      }));

    onComplete({ selectedSolutions, recommendations });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-earth-900 mb-2">
          Select Solutions You're Interested In
        </h3>
        <p className="text-gray-600">
          Based on your identified problems, here are recommended solutions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uniqueSolutions.map((solution) => (
          <motion.div
            key={solution.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSolution(solution.id)}
            className={cn(
              "p-6 rounded-xl border-2 cursor-pointer transition-all duration-300",
              {
                'border-organic-500 bg-organic-50': selectedSolutions.includes(solution.id),
                'border-gray-200 hover:border-organic-300': !selectedSolutions.includes(solution.id)
              }
            )}
          >
            <div className="flex items-start space-x-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                selectedSolutions.includes(solution.id) 
                  ? "bg-organic-500 text-white" 
                  : "bg-gray-100 text-earth-600"
              )}>
                {solution.type === 'product' && <ShoppingCart className="w-6 h-6" />}
                {solution.type === 'practice' && <Wrench className="w-6 h-6" />}
                {solution.type === 'consultation' && <Users className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-earth-900">{solution.name}</h3>
                  <Badge variant="outline" className="text-xs capitalize">
                    {solution.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{solution.description}</p>
                {solution.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-organic-600">
                      ₹{solution.price.toLocaleString()}
                    </span>
                    {solution.rating && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-1">{solution.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={selectedSolutions.length === 0}
          className="flex items-center bg-organic-500 hover:bg-organic-600"
        >
          Get Recommendations
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function RecommendationsStep({ onNext, onPrev, onComplete, currentData }: DiscoveryStepProps) {
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  const addToCart = (productId: string) => {
    setAddedToCart(prev => new Set(prev).add(productId));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-organic-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-10 h-10 text-organic-600" />
        </div>
        <h2 className="text-3xl font-bold text-earth-900 mb-2">
          Your Personalized Recommendations
        </h2>
        <p className="text-xl text-gray-600">
          Based on your selections, here are the best solutions for your farm
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentData.recommendations.map((recommendation: Recommendation) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-video bg-organic-50 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold text-organic-200">
                  {recommendation.name.charAt(0)}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-earth-900">{recommendation.name}</h3>
                <Badge variant="outline" className="text-xs capitalize">
                  {recommendation.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">{recommendation.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-organic-600">
                    ₹{recommendation.price?.toLocaleString() || 'TBD'}
                  </span>
                  {recommendation.rating && (
                    <div className="ml-3 flex items-center">
                      <span className="text-sm text-gray-600 mr-1">{recommendation.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  )}
                </div>
                <div className="text-xs bg-organic-100 text-organic-800 px-2 py-1 rounded-full">
                  {Math.round(recommendation.relevanceScore)}% match
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mb-4 italic">
                {recommendation.whyRecommended}
              </div>
              
              <Button 
                className={`w-full ${addedToCart.has(recommendation.id) ? 'bg-green-500 hover:bg-green-600' : 'bg-organic-500 hover:bg-organic-600'}`}
                onClick={() => addToCart(recommendation.id)}
                disabled={addedToCart.has(recommendation.id)}
              >
                {addedToCart.has(recommendation.id) ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                {addedToCart.has(recommendation.id) ? 'Added to Cart' : 'Add to Cart'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-6">
        <Button 
          variant="outline" 
          size="lg" 
          className="mr-4"
          onClick={onPrev}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Solutions
        </Button>
        <Button 
          size="lg" 
          className="bg-organic-500 hover:bg-organic-600"
          onClick={() => window.location.href = '/shop'}
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default EnhancedProductDiscovery;