import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {

  return twMerge(clsx(inputs))

}



/**

 * Masks sensitive PII fields in an object for safe logging

 */

export function maskPII(data: any): any {

  if (!data || typeof data !== 'object') return data;



  const sensitiveFields = [

    'email', 'phone', 'first_name', 'last_name', 

    'billing_address', 'shipping_address', 'gst_number',

    'contact_name', 'company_name', 'address', 'zip', 'city', 'state',

    'Email', 'Phone', 'First_Name', 'Last_Name', 'Company', 'GST_No'

  ];



  const masked = Array.isArray(data) ? [...data] : { ...data };



  for (const key in masked) {

    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {

      masked[key] = '[REDACTED]';

    } else if (typeof masked[key] === 'object') {

      masked[key] = maskPII(masked[key]);

    }

  }



  return masked;

}
