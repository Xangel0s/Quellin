import React from 'react';

const GlobalLoader: React.FC<{ large?: boolean }> = ({ large = true }) => {
  const size = large ? 64 : 32;
  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-50">
      <svg
        width={size}
        height={size}
        className="logo text-teal-600"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        // play the pulse animation once in ~1.5s
        style={{ animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) 1 forwards' }}
      >
        <path d="M14.25 4.509V19.5H12.75V4.509C12.75 4.077 12.923 3.663 13.228 3.358C13.534 3.052 13.948 2.879 14.38 2.879C14.811 2.879 15.225 3.052 15.53 3.358C15.836 3.663 16.009 4.077 16.009 4.509H14.25Z M9.75 19.5V10.125C9.75 9.693 9.923 9.279 10.228 8.974C10.534 8.668 10.948 8.495 11.38 8.495C11.811 8.495 12.225 8.668 12.53 8.974C12.836 9.279 13.009 9.693 13.009 10.125H11.25V19.5H9.75Z M6 19.5V14.25C6 13.819 6.173 13.405 6.478 13.099C6.784 12.793 7.198 12.621 7.629 12.621C8.06 12.621 8.474 12.793 8.78 13.099C9.085 13.405 9.258 13.819 9.258 14.25H7.5V19.5H6Z" />
      </svg>
    </div>
  );
};

export default GlobalLoader;
