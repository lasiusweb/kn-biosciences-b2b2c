// lib/accessibility.ts
import { useEffect, useState, useRef, RefObject } from 'react';

/**
 * Accessibility utilities for KN Biosciences e-commerce platform
 */

// Focus trap for modal dialogs
export function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

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

    document.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [active, containerRef]);
}

// Skip navigation link component
export function SkipNavLink({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

// Announce content to screen readers
export function useA11yAnnouncer() {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!announcement) return;

    const announce = (message: string) => {
      const element = document.createElement('div');
      const id = 'a11y-announcement';
      
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.id = id;
      element.textContent = message;
      
      document.body.appendChild(element);
      
      // Remove after announcement
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          document.body.removeChild(el);
        }
      }, 1000);
    };

    announce(announcement);
  }, [announcement]);

  const announce = (message: string) => {
    setAnnouncement(message);
  };

  return { announce };
}

// High contrast mode detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    
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
}

// Reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(!e.matches); // Note: e.matches is true when motion is reduced
    };

    setPrefersReducedMotion(!mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

// Screen reader only utility
export const ScreenReaderOnly = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

// Focus visible polyfill for better keyboard navigation
export function useFocusVisible() {
  useEffect(() => {
    let hadKeyboardEvent = true;
    let hadFocusVisible = true;

    const inputTypesWhitelist = {
      text: true,
      search: true,
      url: true,
      tel: true,
      email: true,
      password: true,
      number: true,
      date: true,
      month: true,
      week: true,
      time: true,
      datetime: true,
      'datetime-local': true,
    };

    /**
     * Computes whether the given element should automatically trigger the
     * `focus-visible` class being added, i.e. whether it should always match
     * `:focus-visible` when focused.
     * @param {Element} el
     * @return {boolean}
     */
    function focusTriggersKeyboardModality(el: Element) {
      const type = (el as HTMLInputElement).type;
      const tagName = el.tagName;

      if (
        tagName === 'INPUT' &&
        inputTypesWhitelist[type] &&
        !(el as HTMLInputElement).readOnly
      ) {
        return true;
      }

      if (tagName === 'TEXTAREA' && !(el as HTMLTextAreaElement).readOnly) {
        return true;
      }

      if ((el as HTMLElement).isContentEditable) {
        return true;
      }

      return false;
    }

    /**
     * Add the `focus-visible` class to the given element if it was not added by
     * the author.
     * @param {Element} el
     */
    function addFocusVisibleClass(el: Element) {
      if (el.classList.contains('focus-visible')) {
        return;
      }
      el.classList.add('focus-visible');
      el.setAttribute('data-focus-visible-added', '');
    }

    /**
     * Remove the `focus-visible` class from the given element.
     * @param {Element} el
     */
    function removeFocusVisibleClass(el: Element) {
      el.classList.remove('focus-visible');
      el.removeAttribute('data-focus-visible-added');
    }

    /**
     * If the most recent user interaction was via the keyboard;
     * and the key press did not include a meta, alt/option, or control key;
     * then the modality is keyboard. Otherwise, the modality is not keyboard.
     * Apply `focus-visible` to any current active element and keep track
     * of our keyboard modality state with `hadKeyboardEvent`.
     * @param {KeyboardEvent} e
     */
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      if (!hadKeyboardEvent) {
        hadKeyboardEvent = true;
      }

      if (focusTriggersKeyboardModality(e.target as Element)) {
        addFocusVisibleClass(e.target as Element);
      }

      if (!hadFocusVisible) {
        hadFocusVisible = true;
      }
    }

    /**
     * On `blur`, remove the `focus-visible` class from the target if it was
     * previously added.
     * @param {Event} e
     */
    function onBlur(e: FocusEvent) {
      if (!(e.target as Element).classList.contains('focus-visible')) {
        return;
      }

      removeFocusVisibleClass(e.target as Element);
    }

    /**
     * When the polfyill first loads, assume the user is in keyboard modality.
     * If any event is received from a pointing device (e.g. mouse, pointer,
     * touch), turn off keyboard modality.
     * This accounts for situations where focus enters the page from the URL bar.
     * @param {Event} e
     */
    function onPointerDown() {
      hadKeyboardEvent = false;
      hadFocusVisible = false;
    }

    /**
     * On `focus`, add the `focus-visible` class to the target if:
     * - the target received focus as a result of keyboard navigation, or
     * - the event target is an element that will likely require interaction
     *   via the keyboard (e.g. a text box)
     * @param {Event} e
     */
    function onFocus(e: FocusEvent) {
      // Prevent IE from focusing the document or HTML element.
      if (!(e.target as Element).ownerDocument || (e.target as Element).ownerDocument.documentElement === e.target) {
        return;
      }

      if (hadKeyboardEvent || focusTriggersKeyboardModality(e.target as Element)) {
        addFocusVisibleClass(e.target as Element);
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focus', onFocus, true);
    document.addEventListener('blur', onBlur, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focus', onFocus, true);
      document.removeEventListener('blur', onBlur, true);
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('touchstart', onPointerDown, true);
    };
  }, []);
}

// Color contrast checker
export function checkColorContrast(foreground: string, background: string): number {
  // Convert hex to RGB
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

  // Calculate luminance
  const luminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const [r1, g1, b1] = hexToRgb(foreground);
  const [r2, g2, b2] = hexToRgb(background);

  const lum1 = luminance(r1, g1, b1);
  const lum2 = luminance(r2, g2, b2);
  const ratio = lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);

  return parseFloat(ratio.toFixed(2));
}

// Accessibility checker for components
export function useAccessibilityChecker(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`%cAccessibility Check: ${componentName}`, 'color: #8BC34A; font-weight: bold;');
      console.info('Component mounted. Ensure proper ARIA attributes and semantic HTML are used.');
      console.groupEnd();
    }
  }, [componentName]);
}

// ARIA live region component
export function AriaLiveRegion({ 
  children, 
  politeness = 'polite' 
}: { 
  children: React.ReactNode; 
  politeness?: 'polite' | 'assertive' 
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
}

// Accessible modal component
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  labelledBy?: string;
  describedBy?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  labelledBy,
  describedBy
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, modalRef);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy || 'modal-title'}
      aria-describedby={describedBy}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
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
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

// Accessible dropdown component
interface AccessibleDropdownProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
  id?: string;
  selectedValue?: string;
}

export function AccessibleDropdown({
  label,
  options,
  onSelect,
  id,
  selectedValue
}: AccessibleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <span className="block truncate">
          {selectedValue 
            ? options.find(opt => opt.value === selectedValue)?.label || label 
            : label}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className={`h-5 w-5 text-earth-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
              aria-selected={selectedValue === option.value}
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
              {selectedValue === option.value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-organic-600">
                  <CheckIcon className="h-5 w-5" />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Accessible tabs component
interface AccessibleTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
}

export function AccessibleTabs({ tabs }: AccessibleTabsProps) {
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
}

// Accessible image component with proper alt text handling
interface AccessibleImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  fallbackAlt?: string;
}

export function AccessibleImage({
  src,
  alt,
  caption,
  className = '',
  fallbackAlt = 'Image'
}: AccessibleImageProps) {
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
}

// Accessibility utility functions
export const AccessibilityUtils = {
  useFocusTrap,
  SkipNavLink,
  useA11yAnnouncer,
  useHighContrastMode,
  useReducedMotion,
  ScreenReaderOnly,
  useFocusVisible,
  checkColorContrast,
  useAccessibilityChecker,
  AriaLiveRegion,
  AccessibleModal,
  AccessibleDropdown,
  AccessibleTabs,
  AccessibleImage
};

export default AccessibilityUtils;