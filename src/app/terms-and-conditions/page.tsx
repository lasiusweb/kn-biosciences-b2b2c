import { PolicyLayout } from '@/components/layout/policy-layout';

export default function TermsAndConditions() {
  return (
    <PolicyLayout title="Terms and Conditions" lastUpdated="January 31, 2026">
      <section>
        <h2>1. Agreement to Terms</h2>
        <p>By accessing or using our services, you agree to be bound by these Terms and Conditions.</p>
      </section>
      <section>
        <h2>2. B2B and Wholesale</h2>
        <p>Special terms apply to wholesale distributors and B2B clients regarding bulk pricing and minimum order quantities.</p>
      </section>
    </PolicyLayout>
  );
}
