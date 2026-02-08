// Accessibility utilities for KN Biosciences application
import React, { useEffect, useState, KeyboardEvent } from 'react';

/**
 * Accessibility utilities and components for the KN Biosciences application
 */

// ARIA live regions for announcements
export const AriaLiveRegion = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

// Skip link for keyboard navigation
export const SkipLink = () => {
  const handleClick = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-organic-500 focus:text-white focus:rounded focus:no-underline"
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
};

// Focus trap for modal dialogs
export const useFocusTrap = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab as any);
    firstElement.focus();

    return () => {
      document.removeEventListener('keydown', handleTab as any);
    };
  }, [isActive]);
};

// High contrast mode detector
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    setIsHighContrast(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isHighContrast;
};

// Screen reader announcement hook
export const useAnnouncer = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('');
    
    // Trigger re-render by clearing and setting the announcement
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  return { announcement, announce };
};

// Accessible modal component
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  labelledBy?: string;
  describedBy?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  labelledBy,
  describedBy
}) => {
  useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy || 'modal-title'}
      aria-describedby={describedBy}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        role="document"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 
            id={labelledBy || 'modal-title'} 
            className="text-xl font-bold text-earth-900"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-earth-500 hover:text-earth-700 focus:outline-none focus:ring-2 focus:ring-organic-500 rounded-full p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Accessible dropdown component
interface AccessibleDropdownProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
  id?: string;
}

export const AccessibleDropdown: React.FC<AccessibleDropdownProps> = ({
  label,
  options,
  onSelect,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusedIndex(options.length - 1);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(options[index].value);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2 text-left bg-white border border-earth-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-organic-500 focus:border-organic-500"
      >
        {label}
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className={`h-5 w-5 text-earth-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={focusedIndex === index}
              className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-organic-50 ${
                focusedIndex === index ? 'bg-organic-100' : ''
              }`}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
                setFocusedIndex(-1);
              }}
              onKeyDown={(e) => handleOptionKeyDown(e, index)}
              tabIndex={focusedIndex === index ? 0 : -1}
            >
              <div className="flex items-center">
                <span className="font-normal ml-3 block truncate">
                  {option.label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Accessible tabs component
interface AccessibleTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
}

export const AccessibleTabs: React.FC<AccessibleTabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabId);
    }
  };

  return (
    <div className="w-full">
      <div 
        role="tablist" 
        aria-label="Content tabs"
        className="flex border-b border-earth-200"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'text-organic-600 border-b-2 border-organic-600'
                : 'text-earth-500 hover:text-earth-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={`panel-${tab.id}`}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className={activeTab === tab.id ? 'p-4' : 'hidden'}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

// Color contrast checker utility
export const checkColorContrast = (foregroundColor: string, backgroundColor: string): {
  ratio: number;
  level: 'fail' | 'aa' | 'aaa';
} => {
  // Convert hex colors to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : [0, 0, 0]; // Default to black if invalid hex
  };

  const [r1, g1, b1] = hexToRgb(foregroundColor);
  const [r2, g2, b2] = hexToRgb(backgroundColor);

  // Calculate luminance
  const luminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = luminance(r1, g1, b1);
  const l2 = luminance(r2, g2, b2);
  const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);

  // Determine contrast level
  let level: 'fail' | 'aa' | 'aaa' = 'fail';
  if (ratio >= 7.0) {
    level = 'aaa';
  } else if (ratio >= 4.5) {
    level = 'aa';
  }

  return { ratio: parseFloat(ratio.toFixed(2)), level };
};

// Accessibility checker for components
export const useAccessibilityChecker = (componentName: string) => {
  useEffect(() => {
    // Log accessibility warnings during development
    if (process.env.NODE_ENV === 'development') {
      console.group(`%cAccessibility Check: ${componentName}`, 'color: #8BC34A; font-weight: bold;');
      console.info('Component mounted. Ensure proper ARIA attributes and semantic HTML are used.');
      console.groupEnd();
    }
  }, [componentName]);
};

// Accessible image component with proper alt text handling
interface AccessibleImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  fallbackAlt?: string;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  caption,
  className = '',
  fallbackAlt = 'Image'
}) => {
  const [hasError, setHasError] = useState(false);
  const imageAlt = hasError ? (fallbackAlt || 'Image') : alt;

  return (
    <figure className={className}>
      <img
        src={src}
        alt={imageAlt}
        onError={() => setHasError(true)}
        className="w-full h-auto object-cover"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-earth-600 sr-only">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// Export all accessibility utilities
export const AccessibilityUtils = {
  AriaLiveRegion,
  SkipLink,
  useFocusTrap,
  useHighContrast,
  useAnnouncer,
  AccessibleModal,
  AccessibleDropdown,
  AccessibleTabs,
  checkColorContrast,
  useAccessibilityChecker,
  AccessibleImage
};

export default AccessibilityUtils;