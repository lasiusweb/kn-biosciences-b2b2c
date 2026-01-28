import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-earth-900 mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-earth-600 max-w-2xl mx-auto">
          We're here to help you with all your agricultural and aquaculture needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Contact Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                Send us a message and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="product">Product Information</SelectItem>
                      <SelectItem value="order">Order Support</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="b2b">B2B Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us how we can help you..."
                    rows={4}
                  />
                </div>
                
                <Button className="w-full bg-organic-500 hover:bg-organic-600">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-organic-500" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-earth-600">1800-XXX-XXXX</p>
                  <p className="text-earth-600">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-organic-500" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-earth-600">info@knbiosciences.com</p>
                  <p className="text-earth-600">support@knbiosciences.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-organic-500" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-earth-600">123 Farm Road</p>
                  <p className="text-earth-600">Agricultural District</p>
                  <p className="text-earth-600">India - 500001</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-organic-500" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-earth-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-earth-600">Saturday: 9:00 AM - 2:00 PM</p>
                  <p className="text-earth-600">Sunday: Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Support</CardTitle>
              <CardDescription>
                For urgent agricultural emergencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="font-semibold text-red-800 mb-2">24/7 Hotline</p>
                <p className="text-2xl font-bold text-red-600">1800-XXX-999</p>
                <p className="text-sm text-red-600 mt-2">
                  Available for emergency agricultural and aquaculture issues
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">How can I place a bulk order?</h4>
              <p className="text-earth-600">
                You can place bulk orders through our B2B portal or contact our sales team directly for customized pricing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Do you provide technical support?</h4>
              <p className="text-earth-600">
                Yes, we provide comprehensive technical support for all our products. Contact our expert team for guidance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What is your delivery timeline?</h4>
              <p className="text-earth-600">
                Standard delivery takes 3-5 business days. Express delivery is available for urgent requirements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Are your products organic certified?</h4>
              <p className="text-earth-600">
                Yes, all our organic products are certified by relevant agricultural authorities and meet international standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}