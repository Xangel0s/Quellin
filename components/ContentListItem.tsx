
import React from 'react';
import type { StoredContentItem } from '../types';
import { AcademicCapIcon, DocumentDuplicateIcon, EyeIcon, LinkIcon, TrashIcon, BarChartIcon } from './icons';
import { useData } from '../contexts/DataContext';

interface ContentListItemProps {
    item: StoredContentItem;
    onShare: (item: StoredContentItem) => void;
    onNavigate: (view: 'viewer' | 'analytics', context: StoredContentItem) => void;
}

const ContentListItem: React.FC<ContentListItemProps> = ({ item, onShare, onNavigate }) => {
    const { deleteContentItem } = useData();

    const handleView = () => onNavigate('viewer', item);
    const handleAnalytics = () => onNavigate('analytics', item);
    const handleShare = () => onShare(item);
    const handleDelete = () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${item.title}"? Esta acción no se puede deshacer.`)) {
            deleteContentItem(item.id);
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    const typeInfo = {
        quiz: {
            icon: <DocumentDuplicateIcon className="w-5 h-5 text-sky-600" />,
            label: "Cuestionario",
            bg: "bg-sky-100",
            text: "text-sky-800"
        },
        course: {
            icon: <AcademicCapIcon className="w-5 h-5 text-purple-600" />,
            label: "Curso",
            bg: "bg-purple-100",
            text: "text-purple-800"
        }
    }

    return (
        <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-grow min-w-0">
                 <div className={`p-3 rounded-lg ${typeInfo[item.type].bg}`}>
                    {typeInfo[item.type].icon}
                </div>
                <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800 truncate" title={item.title}>{item.title}</h4>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo[item.type].bg} ${typeInfo[item.type].text}`}>
                            {typeInfo[item.type].label}
                        </span>
                        <span>Creado: {formatDate(item.created_at)}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <button onClick={handleAnalytics} title="Resultados" className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-md transition-colors"><BarChartIcon className="w-5 h-5" /></button>
                <button onClick={handleView} title="Ver" className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-md transition-colors"><EyeIcon className="w-5 h-5" /></button>
                <button onClick={handleShare} title="Compartir o Publicar" className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-md transition-colors"><LinkIcon className="w-5 h-5" /></button>
                <button onClick={handleDelete} title="Eliminar" className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"><TrashIcon className="w-5 h-5" /></button>
            </div>
        </div>
    );
}

export default ContentListItem;