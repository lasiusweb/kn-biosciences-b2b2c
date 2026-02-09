'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react'
import { useEnterpriseCart } from '@/hooks/use-enterprise-cart'
import { MiniCart } from '@/components/shop/mini-cart'
import { SearchWithSuggestions } from '@/components/ui/search-with-suggestions'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cart, toggleMiniCart } = useEnterpriseCart()

  const mainNav = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Knowledge Center', href: '/knowledge' },
    { name: 'Contact', href: '/contact' },
    { name: 'Shop', href: '/shop' },
  ]

  const shopBySegment = [
    { name: 'Agriculture', href: '/shop/agriculture' },
    { name: 'Aquaculture', href: '/shop/aquaculture' },
    { name: 'Poultry Healthcare', href: '/shop/poultry-healthcare' },
    { name: 'Animal Healthcare', href: '/shop/animal-healthcare' },
    { name: 'Bioremediation', href: '/shop/bioremediation' },
    { name: 'Seeds', href: '/shop/seeds' },
    { name: 'Organic Farming', href: '/shop/organic-farming' },
    { name: 'Farm Equipment', href: '/shop/farm-equipment' },
    { name: 'Testing Lab', href: '/shop/testing-lab' },
    { name: 'Oilpalm', href: '/shop/oilpalm' },
  ]

  const handleSearch = (query: string) => {
    // Navigate to search results page
    window.location.href = `/search?query=${encodeURIComponent(query)}`;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="hidden lg:flex items-center justify-between py-2 text-sm border-b">
          <div className="flex items-center space-x-4">
            <span className="text-organic-600">📞 1800-XXX-XXXX</span>
            <span className="text-organic-600">✉️ info@knbiosciences.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/b2b" className="text-earth-600 hover:text-earth-700 font-medium">
              B2B Portal
            </Link>
            <Link href="/track-order" className="text-organic-600 hover:text-organic-700">
              Track Order
            </Link>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-organic-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">KN</span>
            </div>
            <div>
              <span className="text-xl font-bold text-earth-800">KN Biosciences</span>
              <p className="text-xs text-organic-600">Sustainable Agricultural Solutions</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-earth-700 hover:text-organic-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block w-64">
              <SearchWithSuggestions onSearch={handleSearch} />
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={toggleMiniCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {!cart.loading && cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-organic-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cart.totalItems > 99 ? '99+' : cart.totalItems}
                </span>
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Shop by segment dropdown */}
        <div className="hidden lg:block border-t py-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-earth-600">Shop by Segment:</span>
            <div className="flex flex-wrap gap-2">
              {shopBySegment.map((segment) => (
                <Link
                  key={segment.name}
                  href={segment.href}
                  className="text-sm text-organic-600 hover:text-organic-700 hover:bg-organic-50 px-2 py-1 rounded transition-colors"
                >
                  {segment.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              {mainNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-earth-700 hover:text-organic-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-earth-600 mb-2">Shop by Segment:</p>
                <div className="grid grid-cols-2 gap-2">
                  {shopBySegment.map((segment) => (
                    <Link
                      key={segment.name}
                      href={segment.href}
                      className="text-sm text-organic-600 hover:text-organic-700 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {segment.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Mini Cart */}
      <MiniCart />
    </header>
  )
}