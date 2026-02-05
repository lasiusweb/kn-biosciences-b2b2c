'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to submit');

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We will get back to you shortly.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-[#795548] text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Get In Touch
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Have questions about our products or solutions? We're here to help. Reach out to us today.
          </p>
        </div>
      </section>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#795548]">Contact Information</h2>
              <p className="text-lg text-muted-foreground">
                Visit our office or reach out to us through any of the following channels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="bg-[#8BC34A]/10 p-3 rounded-xl text-[#8BC34A]">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Call Us</h3>
                  <p className="text-muted-foreground text-sm">+91 40 1234 5678</p>
                  <p className="text-muted-foreground text-sm">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#8BC34A]/10 p-3 rounded-xl text-[#8BC34A]">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email Us</h3>
                  <p className="text-muted-foreground text-sm">info@knbiosciences.in</p>
                  <p className="text-muted-foreground text-sm">sales@knbiosciences.in</p>
                </div>
              </div>

              <div className="flex items-start gap-4 md:col-span-2">
                <div className="bg-[#8BC34A]/10 p-3 rounded-xl text-[#8BC34A]">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Our Office</h3>
                  <p className="text-muted-foreground text-sm">
                    Plot No. 123, Bio-Tech Park, Phase-II, Hyderabad, Telangana, India - 500078
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Placeholder */}
            <div className="h-[300px] bg-muted rounded-2xl overflow-hidden relative shadow-inner border border-border">
               <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <MapPin size={48} className="opacity-20 mb-4" />
                  <span className="text-sm">Interactive Map Coming Soon</span>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-3xl shadow-lg border border-border animate-in fade-in slide-in-from-right-4 duration-1000">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                  <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <Input id="phone" name="phone" placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" name="subject" placeholder="Product Inquiry" required />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea 
                  id="message" 
                  name="message" 
                  placeholder="How can we help you?" 
                  className="min-h-[150px]"
                  required 
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg bg-[#8BC34A] hover:bg-[#7CB342]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
