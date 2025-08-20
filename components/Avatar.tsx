
import React from 'react';

interface AvatarProps {
    profile: {
        avatar: {
            color: string;
            initials: string;
        };
        name: string;
    };
    size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ profile, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-2xl',
    };

    return (
        <div 
            className={`flex items-center justify-center rounded-full font-bold text-white flex-shrink-0 ${sizeClasses[size]} ${profile.avatar.color}`}
            title={profile.name}
        >
            {profile.avatar.initials}
        </div>
    );
};

export default Avatar;
