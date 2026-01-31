import { PolicyLayout } from '@/components/layout/policy-layout';

export default function Disclaimer() {
  return (
    <PolicyLayout title="Disclaimer" lastUpdated="January 31, 2026">
      <section>
        <h2>1. Product Application</h2>
        <p>The information provided regarding product application is for general guidance only. Results may vary based on environmental factors.</p>
      </section>
      <section>
        <h2>2. Professional Advice</h2>
        <p>Always consult with an agricultural expert before implementing new fertilization or pest control programs.</p>
      </section>
    </PolicyLayout>
  );
}
