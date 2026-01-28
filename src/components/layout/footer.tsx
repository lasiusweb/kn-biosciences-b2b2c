import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Products', href: '/shop' },
    { name: 'Knowledge Center', href: '/knowledge' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Refund Policy', href: '/refund' },
  ]

  const shopByCategory = [
    { name: 'Bio-Fertilizers', href: '/shop/bio-fertilizers' },
    { name: 'Pre-Probiotics', href: '/shop/pre-probiotics' },
    { name: 'Organic pesticides', href: '/shop/organic-pesticides' },
    { name: 'Growth Promoters', href: '/shop/growth-promoters' },
    { name: 'Soil Conditioners', href: '/shop/soil-conditioners' },
    { name: 'Aquaculture Products', href: '/shop/aquaculture' },
  ]

  const farmingSegments = [
    { name: 'For Crop Champions', href: '/farming/crop-champions' },
    { name: 'For Pond Champions', href: '/farming/pond-champions' },
    { name: 'For Poultry Pros', href: '/farming/poultry-pros' },
    { name: 'For Organic Newbies', href: '/farming/organic-newbies' },
    { name: 'Farm Equipment', href: '/shop/farm-equipment' },
  ]

  return (
    <footer className="bg-earth-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-organic-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">KN</span>
              </div>
              <div>
                <span className="text-xl font-bold">KN Biosciences</span>
                <p className="text-xs text-organic-200">Sustainable Agricultural Solutions</p>
              </div>
            </div>
            <p className="text-earth-100 mb-4 text-sm">
              Leading provider of innovative bio-fertilizers and sustainable agricultural solutions for modern farming.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-earth-300 hover:text-organic-400">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-earth-300 hover:text-organic-400">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-earth-300 hover:text-organic-400">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-earth-300 hover:text-organic-400">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-organic-400">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-earth-100 hover:text-organic-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop by Category */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-organic-400">Shop by Category</h3>
            <ul className="space-y-2">
              {shopByCategory.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-earth-100 hover:text-organic-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Farming Segments */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-organic-400">Contact Us</h3>
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-earth-100 text-sm">
                <Phone className="h-4 w-4 text-organic-400" />
                <span>1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center space-x-2 text-earth-100 text-sm">
                <Mail className="h-4 w-4 text-organic-400" />
                <span>info@knbiosciences.com</span>
              </div>
              <div className="flex items-start space-x-2 text-earth-100 text-sm">
                <MapPin className="h-4 w-4 text-organic-400 mt-1" />
                <span>123 Farm Road, Agricultural District, India - 500001</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4 text-organic-400">Farming Solutions</h3>
            <ul className="space-y-2">
              {farmingSegments.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-earth-100 hover:text-organic-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-earth-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-organic-400 mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-earth-100 text-sm">
                Get the latest updates on sustainable farming and exclusive offers.
              </p>
            </div>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-l bg-earth-800 border border-earth-700 text-earth-100 placeholder-earth-400 focus:outline-none focus:border-organic-400"
              />
              <button className="px-6 py-2 bg-organic-500 text-white rounded-r hover:bg-organic-600 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-earth-700 mt-8 pt-8 text-center">
          <p className="text-earth-100 text-sm">
            © {new Date().getFullYear()} KN Biosciences. All rights reserved. | 
            <Link href="/privacy" className="hover:text-organic-400 ml-1">Privacy Policy</Link> | 
            <Link href="/terms" className="hover:text-organic-400 ml-1">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}