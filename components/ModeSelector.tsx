
import React from 'react';
import { DocumentDuplicateIcon, AcademicCapIcon } from './icons';

type GenerationMode = 'quiz' | 'course';

interface ModeSelectorProps {
  selectedMode: GenerationMode;
  onSelectMode: (mode: GenerationMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
  const getButtonClasses = (mode: GenerationMode) => {
    const baseClasses = 'flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2';
    if (selectedMode === mode) {
      return `${baseClasses} bg-teal-600 text-white shadow-sm`;
    }
    return `${baseClasses} bg-slate-200 text-slate-700 hover:bg-slate-300`;
  };

  return (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Contenido a Generar</label>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
                type="button"
                className={getButtonClasses('quiz')}
                onClick={() => onSelectMode('quiz')}
                aria-pressed={selectedMode === 'quiz'}
            >
                <DocumentDuplicateIcon className="w-5 h-5" />
                <span>Cuestionario Único</span>
            </button>
            <button
                type="button"
                className={getButtonClasses('course')}
                onClick={() => onSelectMode('course')}
                aria-pressed={selectedMode === 'course'}
            >
                <AcademicCapIcon className="w-5 h-5" />
                <span>Curso Interactivo</span>
            </button>
        </div>
    </div>
  );
};

export default ModeSelector;