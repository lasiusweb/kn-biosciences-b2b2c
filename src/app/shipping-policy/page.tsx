import { PolicyLayout } from '@/components/layout/policy-layout';

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy" lastUpdated="January 31, 2026">
      <section>
        <h2>1. Delivery Times</h2>
        <p>We aim to process and ship all orders within 2-3 business days. Delivery times vary by location.</p>
      </section>
      <section>
        <h2>2. Shipping Rates</h2>
        <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
      </section>
    </PolicyLayout>
  );
}
