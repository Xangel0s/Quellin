import React from 'react';

const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3.375 3.375 0 1118.5 6.586l-10.94 10.94a1.875 1.875 0 11-2.652-2.652l7.693-7.693a.375.375 0 01.53 0l.53.53a.375.375 0 010 .53l-7.693 7.693a.375.375 0 01-.53 0l-.53-.53a.375.375 0 010-.53l7.693-7.693" />
    </svg>
);

export default PaperClipIcon;
