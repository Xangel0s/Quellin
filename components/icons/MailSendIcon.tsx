import React from 'react';

const MailSendIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <style>
            {`
            @keyframes fly {
                0% { transform: translate(10px, -15px) rotate(15deg); opacity: 1; }
                50% { transform: translate(-40px, 10px) rotate(-30deg); opacity: 1; }
                100% { transform: translate(-100px, -20px) rotate(-45deg); opacity: 0; }
            }
            @keyframes check-pop {
                0% { transform: scale(0); opacity: 0; }
                70% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .envelope-base { fill: #A5B4FC; }
            .envelope-flap { fill: #818CF8; }
            .paper { fill: #E0E7FF; animation: fly 2s ease-out forwards; animation-delay: 0.5s; }
            .check-circle { fill: #34D399; transform-origin: center; animation: check-pop 0.5s ease-out forwards; animation-delay: 2.5s; opacity: 0; }
            .check-mark { stroke: white; stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }
            `}
        </style>
        
        {/* Envelope back */}
        <path className="envelope-base" d="M10 30 H90 V80 H10 Z" />
        
        {/* Paper (initially inside) */}
        <g className="paper">
            <rect x="25" y="35" width="50" height="40" rx="5" />
            <line x1="35" y1="45" x2="65" y2="45" stroke="#C7D2FE" strokeWidth="4" />
            <line x1="35" y1="55" x2="65" y2="55" stroke="#C7D2FE" strokeWidth="4" />
            <line x1="35" y1="65" x2="55" y2="65" stroke="#C7D2FE" strokeWidth="4" />
        </g>

        {/* Envelope front */}
        <path className="envelope-base" d="M10 80 L50 50 L90 80 Z" />
        <path className="envelope-flap" d="M10 30 L50 60 L90 30 Z" />

        {/* Checkmark animation */}
        <g className="check-circle">
            <circle cx="50" cy="50" r="40" />
            <polyline className="check-mark" points="30,50 45,65 70,35" fill="none" />
        </g>
    </svg>
);

export default MailSendIcon;