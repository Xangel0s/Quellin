
import React from 'react';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.51.056 1.02.086 1.5.086s.99-.03 1.5-.086m-7.5 2.962a9.098 9.098 0 013.741-.479 3 3 0 014.682-2.72m-7.5 2.962V18a3 3 0 00-3-3H6a3 3 0 00-3 3v.72m9 3.362a9.094 9.094 0 01-3.741-.479 3 3 0 01-4.682-2.72M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm7.5 3.362a9.094 9.094 0 00-3.741.479 3 3 0 00-4.682 2.72" />
    </svg>
);

export default UsersIcon;
