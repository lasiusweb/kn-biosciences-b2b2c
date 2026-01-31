import { PolicyLayout } from '@/components/layout/policy-layout';

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Refund Policy" lastUpdated="January 31, 2026">
      <section>
        <h2>1. Returns</h2>
        <p>We accept returns within 30 days of purchase for most unopened and unused agricultural products.</p>
      </section>
      <section>
        <h2>2. Refunds</h2>
        <p>Once we receive your item, we will inspect it and notify you that we have received your returned item.</p>
      </section>
    </PolicyLayout>
  );
}
