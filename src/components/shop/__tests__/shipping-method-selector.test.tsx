import { render, screen, fireEvent } from '@testing-library/react';
import { ShippingMethodSelector } from '../shipping-method-selector';
import { ShippingRate } from '@/types';
import React, { createContext, useContext } from 'react';

// Simple context for mocking RadioGroup behavior
const RadioContext = createContext<{ value: string, onValueChange: (val: string) => void }>({
  value: '',
  onValueChange: () => {}
});

jest.mock('@/components/ui/radio-group', () => {
  const RadioGroup = ({ children, value, onValueChange }: any) => (
    <RadioContext.Provider value={{ value, onValueChange }}>
      <div role="radiogroup">{children}</div>
    </RadioContext.Provider>
  );

  const RadioGroupItem = ({ value, id }: any) => {
    const context = useContext(RadioContext);
    return (
      <input 
        type="radio" 
        id={id} 
        value={value} 
        checked={context.value === value}
        onChange={() => context.onValueChange(value)}
      />
    );
  };

  return { RadioGroup, RadioGroupItem };
});

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} role="combobox">
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

describe('ShippingMethodSelector', () => {
  const mockOptions: ShippingRate[] = [
    { type: 'COURIER', carrier_name: 'Delhivery', cost: 100, handling_fee: 0, is_serviceable: true, description: 'Home Delivery' },
    { type: 'TRANSPORT', carrier_name: 'Regional Transport', cost: 0, handling_fee: 150, is_serviceable: true, description: 'Godown Delivery' }
  ];

  it('renders all options', () => {
    render(
      <ShippingMethodSelector 
        options={mockOptions}
        selectedOption={null}
        onSelect={() => {}}
        selectedTransportCarrier=""
        onTransportCarrierChange={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText(/Delhivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Regional Transport/i)).toBeInTheDocument();
  });

  it('shows carrier selector when TRANSPORT is selected', () => {
    render(
      <ShippingMethodSelector 
        options={mockOptions}
        selectedOption={mockOptions[1]} // TRANSPORT
        onSelect={() => {}}
        selectedTransportCarrier=""
        onTransportCarrierChange={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText(/select transport carrier/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onSelect when an option is clicked', () => {
    const onSelect = jest.fn();
    render(
      <ShippingMethodSelector 
        options={mockOptions}
        selectedOption={null}
        onSelect={onSelect}
        selectedTransportCarrier=""
        onTransportCarrierChange={() => {}}
        onProceed={() => {}}
      />
    );

    const courierRadio = screen.getByLabelText(/Delhivery/i);
    fireEvent.click(courierRadio);

    expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
  });
});
