import React from 'react';

export const PrinterIcon: React.FC<{className?: string}> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.25m0 0a2.25 2.25 0 01-2.25 2.25m2.25-2.25a2.25 2.25 0 002.25 2.25m-2.25 2.25V15m14.25-6.171c-.24.03-.48.062-.72.096m.72-.096c-1.35.216-2.863.321-4.47.321s-3.12-.105-4.47-.321m10.56 0L18 18.25m0 0a2.25 2.25 0 01-2.25 2.25m2.25-2.25a2.25 2.25 0 002.25 2.25m-2.25 2.25V15m-1.125-6.375A42.227 42.227 0 0012 5.625a42.227 42.227 0 00-6.375 1.5" />
  </svg>
);
