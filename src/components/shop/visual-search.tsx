import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, Search, X, Loader2 } from 'lucide-react';
import { VisualSearchService } from '@/lib/visual-search-service';
import { Product } from '@/types';

interface VisualSearchProps {
  onResults: (products: Product[]) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function VisualSearch({ onResults, onError, className }: VisualSearchProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Perform visual search
    performVisualSearch(file);
  };

  const performVisualSearch = async (file: File) => {
    setError(null);
    setIsSearching(true);
    setProgress(0);

    try {
      const results = await VisualSearchService.searchByImage(file, {
        minConfidence: 0.7
      });

      // Extract products from results
      const products = results.flatMap(result => result.products);
      onResults(products);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Visual search failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSearching(false);
      setProgress(100);
    }
  };

  const handleCameraClick = () => {
    // In a real implementation, this would open the device camera
    // For now, we'll just trigger the file input
    fileInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Visual Search
        </CardTitle>
        <CardDescription>
          Upload an image to find similar products in our catalog
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-64 object-contain rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isSearching && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing image...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-organic-500 bg-organic-50' 
                : 'border-gray-300 hover:border-organic-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-3 bg-organic-100 rounded-full">
                <Upload className="h-8 w-8 text-organic-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Drop an image here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileInputChange}
        />
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={handleCameraClick}
        >
          <Camera className="h-4 w-4 mr-2" />
          Use Camera
        </Button>
        <Button 
          className="w-full sm:w-auto bg-organic-500 hover:bg-organic-600"
          onClick={handleUploadClick}
          disabled={!previewUrl || isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Find Similar Products
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}