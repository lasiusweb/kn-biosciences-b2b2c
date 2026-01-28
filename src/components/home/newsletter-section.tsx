'use client'

import { Button } from '@/components/ui/button'
import { Mail, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email)
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="organic-gradient rounded-2xl p-8 lg:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Stay Updated with Farming Insights
            </h2>
            
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for expert tips, product updates, 
              and exclusive offers on sustainable farming solutions.
            </p>
            
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 text-earth-900 placeholder-earth-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-white text-organic-600 hover:bg-earth-50 font-medium"
                >
                  Subscribe
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                <p className="text-white font-medium">
                  ✓ Thank you for subscribing! Check your email for confirmation.
                </p>
              </div>
            )}
            
            <div className="mt-6 text-sm text-white/80">
              Join 50,000+ farmers getting expert farming insights weekly.
              <br />
              We respect your privacy. Unsubscribe anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}