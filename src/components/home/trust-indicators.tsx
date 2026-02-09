import { Shield, Award, Truck, Leaf, CheckCircle } from 'lucide-react';

const trustIndicators = [
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'SSL encryption and secure payment gateways'
  },
  {
    icon: Award,
    title: 'Certified Products',
    description: 'All products meet quality and safety standards'
  },
  {
    icon: Truck,
    title: 'Reliable Delivery',
    description: 'On-time delivery with tracking'
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Sustainable and environmentally safe solutions'
  },
  {
    icon: CheckCircle,
    title: 'Quality Assured',
    description: 'Rigorous testing and quality control'
  }
];

export function TrustIndicators() {
  return (
    <section className="py-12 bg-organic-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-earth-900 mb-4">Trusted by Thousands of Farmers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our commitment to quality, sustainability, and customer satisfaction sets us apart
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {trustIndicators.map((indicator, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 p-3 bg-organic-100 rounded-full">
                <indicator.icon className="h-8 w-8 text-organic-600" />
              </div>
              <h3 className="font-semibold text-earth-800 mb-2">{indicator.title}</h3>
              <p className="text-sm text-gray-600">{indicator.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-organic-600">5000+</div>
            <div className="text-sm text-gray-600">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-organic-600">98%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-organic-600">15+</div>
            <div className="text-sm text-gray-600">Years Experience</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-organic-600">100+</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
        </div>
      </div>
    </section>
  );
}