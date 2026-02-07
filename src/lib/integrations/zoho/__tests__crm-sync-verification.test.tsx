import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-environment';
import ZohoAuthClient from '@/lib/integrations/zoho/auth';
import ZohoCRMClient from '@/lib/integrations/zoho/crm';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({
    segment: 'cereals',
    crop: 'wheat'
  }),
  usePathname: () => '/cereals/wheat',
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// Mock fetch mock
const mockFetch = jest.fn() as jest.Mock;

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ className, ...props }) => (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-offset-2 disabled:opacity-50',
        className
      )}
      {...props}
    >
      {props.children}
    </button>
  )
}));

describe('Zoho CRM Contact/Lead Sync Verification', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Contact Form Integration', () => {
    it('should include contact sync in registration form', async () => {
      // Mock contact form component
      const ContactForm = () => (
        <div>
          <form data-testid="contact-form">
            <input name="email" type="email" data-testid="contact-email" />
            <input name="name" type="text" data-testid="contact-name" />
            <button type="submit" data-testid="contact-submit">Submit</button>
          </form>
        </div>
      );

      render(<ContactForm />);

      const emailInput = screen.getByTestId('contact-email');
      const nameInput = screen.getByTestId('contact-name');
      const submitButton = screen.getByTestId('contact-submit');

      // Check for sync functionality in form
      expect(screen.getByText(/sync.*zoho.*crm/i)).toBeInTheDocument();
      expect(screen.getByText(/contact.*lead.*zoho/i)).toBeInTheDocument();
      
      // Fill form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      
      // Submit form
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        
        // Should show success message
        expect(screen.getByText(/contact created successfully/i)).toBeInTheDocument();
        
        // Should store Zoho CRM ID
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user_zoho_crm_id', expect.any(String));
      });
    });

    it('should sync contact data to Zoho CRM on form submission', async () => {
      // Mock successful API response
      global.fetch = jest.fn().mockResolvedOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          zoho_crm_id: 'zoho_crm_123456',
          message: 'Contact created successfully in Zoho CRM'
        })
      });

      const ContactForm = () => (
        <div>
          <form data-testid="contact-form">
            <input name="email" type="email" data-testid="contact-email" />
            <button type="submit" data-testid="contact-submit">Submit</button>
          </form>
        </div>
      );

      render(<ContactForm />);

      const emailInput = screen.getByTestId('contact-email');
      const submitButton = screen.getByTestId('contact-submit');

      // Fill form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('email=test@example.com'),
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            })
          })
        );
        
        expect(screen.getByText(/contact created successfully/i)).toBeInTheDocument();
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user_zoho_crm_id', 'zoho_crm_123456');
      });
    });

    it('should handle Zoho API errors gracefully', async () => {
      // Mock API error response
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Zoho API Error'));

      const ContactForm = () => (
        <div>
          <form data-testid="error-form">
            <input name="email" type="email" data-testid="error-email" />
            <button type="submit" data-testid="error-submit">Submit</button>
          </form>
        </div>
      );

      render(<ContactForm />);

      const submitButton = screen.getByTestId('error-submit');
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network.*timeout/i)).toBeInTheDocument();
        expect(screen.getByTestId('error-submit')).toBeDisabled();
      });
    });
  });

  describe('Lead Generation from Product Interest', () => {
    it('should capture product interest as leads', async () => {
      // Mock product page with lead capture
      const ProductPage = () => (
        <div>
          <div>
            <form data-testid="product-interest-form">
              <select name="product_id" data-testid="product-select">
                <option value="prod_1">Product 1</option>
                <option value="prod_2">Product 2</option>
              </select>
              <input name="name" type="text" data-testid="lead-name" />
              <input name="email" type="email" data-testid="lead-email" />
              <input name="phone" type="tel" data-testid="lead-phone" />
              <button type="submit" data-testid="lead-submit">Request Info</button>
            </form>
          </div>
        </div>
      );

      render(<ProductPage />);

      const productSelect = screen.getByTestId('product-select');
      const nameInput = screen.getByTestId('lead-name');
      const emailInput = screen.getByTestId('lead-email');
      const submitButton = screen.getByTestId('lead-submit');

      // Fill form
      fireEvent.change(productSelect, { target: { value: 'prod_1' } });
      fireEvent.change(nameInput, { target: { value: 'Interested Farmer' } });
      fireEvent.change(emailInput, { target: { value: 'farmer@example.com' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('product_id=prod_1'),
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            })
          })
        );
        
        expect(screen.getByText(/lead.*zoho/i)).toBeInTheDocument();
        expect(screen.getByText(/interest.*product.*captured/i)).toBeInTheDocument();
      });
    });
  });

  describe('Newsletter Subscription Lead Capture', () => {
    it('should sync newsletter subscribers to Zoho CRM', async () => {
      // Mock newsletter form
      const NewsletterForm = () => (
        <div>
          <form data-testid="newsletter-form">
            <input name="email" type="email" data-testid="newsletter-email" />
            <input name="interests" type="text" data-testid="newsletter-interests" />
            <button type="submit" data-testid="newsletter-submit">Subscribe</button>
          </form>
        </div>
      );

      render(<NewsletterForm />);

      const emailInput = screen.getByTestId('newsletter-email');
      const submitButton = screen.getByTestId('newsletter-submit');

      // Fill form
      fireEvent.change(emailInput, { target: { value: 'newsletter@test.com' } });
      fireEvent.change(emailInput, { target: { value: 'farming,trends' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        expect(screen.getByText(/newsletter.*zoho.*crm/i)).toBeInTheDocument();
        expect(screen.getByText(/subscribed.*successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Contact Form Integration with User Registration', () => {
    it('should update existing contact in Zoho CRM', async () => {
      // Mock user with existing Zoho CRM ID
      const userWithZohoId = {
        email: 'existing@example.com',
        zoho_crm_id: 'zoho_crm_789012'
      };

      // Mock localStorage with existing user data
      localStorageMock.setItem('user_zoho_crm_id', 'zoho_crm_789012');
      localStorageMock.setItem('user_email', userWithZohoId.email);

      const UpdateContactForm = () => (
        <div>
          <form data-testid="update-contact-form">
            <input name="email" type="email" data-testid="update-email" defaultValue="existing@example.com" />
            <input name="phone" type="tel" data-testid="update-phone" />
            <button type="submit" data-testid="update-submit">Update Contact</button>
          </form>
        </div>
      );

      render(<UpdateContactForm />);

      const submitButton = screen.getByTestId('update-submit');
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'PUT',
            body: expect.objectContaining({
              zoho_crm_id: 'zoho_crm_789012'
            })
          })
        );
        
        expect(screen.getByText(/contact updated successfully/i)).toBeInTheDocument();
        expect(localStorageMock.getItem('user_zoho_crm_id')).toBe('zoho_crm_789012');
      });
    });

    it('should handle duplicate email detection', async () => {
      // Mock existing contact response
      global.fetch = jest.fn().mockResolvedOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          message: 'Email already exists in Zoho CRM'
        })
      });

      const DuplicateContactForm = () => (
        <div>
          <form data-testid="duplicate-form">
            <input name="email" type="email" data-testid="duplicate-email" />
            <button type="submit" data-testid="duplicate-submit">Submit</button>
          </form>
        </div>
      );

      render(<DuplicateContactForm />);

      const submitButton = screen.getByTestId('duplicate-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        expect(screen.getByTestId('duplicate-email')).toHaveClass('border-red-500');
      });
    });
  });

  describe('Batch Lead Processing', () => {
    it('should handle batch lead creation efficiently', async () => {
      const leads = [
        { email: 'lead1@example.com', name: 'Lead 1', source: 'contact_form' },
        { email: 'lead2@example.com', name: 'Lead 2', source: 'newsletter' },
        { email: 'lead3@example.com', name: 'Lead 3', source: 'product_interest' }
      ];

      // Mock localStorage with lead data
      localStorageMock.setItem('pending_leads', JSON.stringify(leads));

      // Mock batch processing function
      const batchProcessLeads = jest.fn();

      render(<div><button onClick={batchProcessLeads} data-testid="batch-process">Process Leads</button></div>);
      
      const processButton = screen.getByTestId('batch-process');
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(batchProcessLeads).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining(JSON.stringify(leads))
          })
        );
        
        expect(screen.getByText(/batch.*processing.*completed/i)).toBeInTheDocument();
        
        expect(localStorageMock.getItem).toHaveBeenCalledWith('pending_leads');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('pending_leads');
      });
    });
  });

  describe('Data Consistency Validation', () => {
    it('should validate email format before sync', async () => {
      // Mock validation error response
      global.fetch = jest.fn().mockResolvedOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          message: 'Invalid email format'
        })
      });

      const ValidationForm = () => (
        <div>
          <form data-testid="validation-form">
            <input name="email" type="email" data-testid="validation-email" />
            <button type="submit" data-testid="validation-submit">Submit</button>
          </form>
        </div>
      );

      render(<ValidationForm />);

      const submitButton = screen.getByTestId('validation-submit');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        expect(screen.getByTestId('validation-email')).toHaveClass('border-red-500');
      });
    });

  describe('API Rate Limiting', () => {
    it('should handle Zoho rate limits', async () => {
      // Mock rate limit error
      global.fetch = jest.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error('Rate limit exceeded'));
      });

      const RateLimitForm = () => (
        <div>
          <form data-testid="rate-limit-form">
            <input name="email" type="email" data-testid="rate-limit-email" />
            <button type="submit" data-testid="rate-limit-submit">Submit</button>
          </form>
        </div>
      </div>
      );

      render(<RateLimitForm />);

      const submitButton = screen.getByTestId('rate-limit-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/rate.*limit.*exceeded/i)).toBeInTheDocument();
        expect(screen.getByTestId('rate-limit-submit')).toBeDisabled();
      });
    });
  });
});