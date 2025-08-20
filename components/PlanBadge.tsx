
import React from 'react';
import { PLANS, PlanName } from '../types';

interface PlanBadgeProps {
    plan: PlanName;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ plan }) => {
    const planInfo = PLANS[plan];

    const colors = {
        free: 'bg-slate-200 text-slate-700',
        pro: 'bg-sky-200 text-sky-800',
        business: 'bg-amber-200 text-amber-800'
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[plan]}`}>
            {planInfo.name}
        </span>
    );
}

export default PlanBadge;