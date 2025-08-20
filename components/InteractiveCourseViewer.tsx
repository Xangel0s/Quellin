
import React, { useState, useEffect } from 'react';
import type { InteractiveCourse, Submission, Attachment } from '../types';
import QuizTaker from './QuizTaker';
import ProgressBar from './ProgressBar';
import Button from './Button';
import { QuillanLogo, InformationCircleIcon, PaperClipIcon, VideoCameraIcon } from './icons';

interface InteractiveCourseViewerProps {
  course: InteractiveCourse;
  attachments?: Attachment[];
  onComplete?: (result: { score: number; total_questions: number; module_attempts: Record<number, number>; }) => void;
}

const PASSING_PERCENTAGE = 0.7; // Require 70% to pass

const CourseCompletionContent: React.FC<{ attachments: Attachment[] }> = ({ attachments }) => {
    
    const getYoutubeEmbedUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            if(urlObj.hostname === 'youtu.be') {
                return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
            }
            if(urlObj.hostname.includes('youtube.com')) {
                const videoId = urlObj.searchParams.get('v');
                if(videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
        } catch(e) { /* Invalid URL */ }
        return null;
    }

    return (
        <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Contenido Adicional</h3>
            <div className="space-y-4">
            {attachments.map((att, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    {att.type === 'file' && (
                        <div className="flex items-start gap-4">
                            <PaperClipIcon className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-slate-800">{att.title}</h4>
                                <p className="text-sm text-slate-600 mb-2">{att.description}</p>
                                <a href="#" download className="text-sm font-semibold text-teal-600 hover:underline">
                                    Descargar "{att.fileName}"
                                </a>
                            </div>
                        </div>
                    )}
                    {att.type === 'video' && (
                        <div>
                            <div className="flex items-start gap-4 mb-3">
                                <VideoCameraIcon className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-slate-800">{att.title}</h4>
                                    <p className="text-sm text-slate-600">{att.description}</p>
                                </div>
                            </div>
                            {getYoutubeEmbedUrl(att.youtubeUrl) ? (
                                <div className="aspect-video">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        src={getYoutubeEmbedUrl(att.youtubeUrl)!}
                                        title={att.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        className="rounded-lg"
                                    ></iframe>
                                </div>
                            ) : (
                                <p className="text-sm text-red-600">Enlace de YouTube inválido.</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
            </div>
        </div>
    )
}

const InteractiveCourseViewer: React.FC<InteractiveCourseViewerProps> = ({ course, attachments, onComplete }) => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moduleStatus, setModuleStatus] = useState<'pending' | 'passed' | 'failed'>('pending');
  const [moduleAttempts, setModuleAttempts] = useState<Record<number, number>>({});
  const [totalScore, setTotalScore] = useState(0);

  const modules = course.modulos || [];

  useEffect(() => {
    if (modules.length > 0 && moduleAttempts[0] === undefined) {
        setModuleAttempts(prev => ({ ...prev, 0: 1 }));
    }
  }, [modules.length, moduleAttempts]);

  const handleQuizSubmit = (score: number) => {
    const totalQuestions = modules[currentModuleIndex].cuestionario.length;
    if (totalQuestions === 0) {
        setModuleStatus('passed');
        return;
    }
    const passingScore = Math.ceil(totalQuestions * PASSING_PERCENTAGE);
    
    if (score >= passingScore) {
        setModuleStatus('passed');
        setTotalScore(prev => prev + score);
    } else {
        setModuleStatus('failed');
    }
  };

  const handleNextModule = () => {
    const nextIndex = currentModuleIndex + 1;
    if (nextIndex < modules.length) {
      setCurrentModuleIndex(nextIndex);
      setModuleStatus('pending');
      if (moduleAttempts[nextIndex] === undefined) {
          setModuleAttempts(prev => ({ ...prev, [nextIndex]: 1 }));
      }
    } else {
      setIsCompleted(true);
    }
  };

  useEffect(() => {
    if (isCompleted) {
        const totalQuestions = modules.reduce((acc, module) => acc + module.cuestionario.length, 0);
        onComplete?.({ 
            score: totalScore, 
            total_questions: totalQuestions,
            module_attempts: moduleAttempts
        });
    }
  }, [isCompleted, totalScore, modules, onComplete, moduleAttempts]);


  const handleRetry = () => {
    setModuleStatus('pending');
    setModuleAttempts(prev => ({ ...prev, [currentModuleIndex]: (prev[currentModuleIndex] || 1) + 1 }));
  };

  const handleRestart = () => {
      setCurrentModuleIndex(0);
      setIsCompleted(false);
      setModuleStatus('pending');
      setModuleAttempts({0: 1});
      setTotalScore(0);
  }

  if (modules.length === 0) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-md">Este curso no contiene módulos.</div>;
  }
  
  const progress = isCompleted ? 100 : (currentModuleIndex / modules.length) * 100;
  const currentModule = modules[currentModuleIndex];

  if (isCompleted) {
    const totalQuestions = modules.reduce((acc, module) => acc + module.cuestionario.length, 0);
    return (
        <div className="p-8">
            <div className="text-center">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                    <QuillanLogo className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">¡Felicidades, has completado el curso!</h2>
                <p className="mt-2 text-slate-600">Has finalizado el curso "{course.titulo}".</p>
                <div className="mt-4 p-4 rounded-lg bg-teal-50 border border-teal-200 text-center inline-block">
                    <h3 className="text-lg font-bold text-teal-800">Puntuación Final</h3>
                    <p className="text-2xl font-bold text-teal-600 my-1">
                        {totalScore} <span className="text-lg font-normal text-slate-600">/ {totalQuestions}</span>
                    </p>
                </div>
                <br/>
                <Button onClick={handleRestart} className="mt-6">
                    Volver a Empezar
                </Button>
            </div>
            {attachments && attachments.length > 0 && <CourseCompletionContent attachments={attachments} />}
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <ProgressBar progress={progress} />
        <p className="text-sm text-slate-600 mt-2 text-center">
            Módulo {currentModuleIndex + 1} de {modules.length}
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentModule.titulo}</h2>
          {currentModule.resumen && <p className="text-slate-700 leading-relaxed">{currentModule.resumen}</p>}
      </div>
      
      {currentModule.contexto_adicional && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">Nota del Creador</h4>
            <p className="text-sm text-blue-700">{currentModule.contexto_adicional}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Autoevaluación del Módulo</h3>
        <QuizTaker 
            key={`${currentModuleIndex}-${moduleAttempts[currentModuleIndex] || 1}`}
            quiz={currentModule.cuestionario} 
            onComplete={(result) => handleQuizSubmit(result.score)}
            disabled={moduleStatus !== 'pending'}
        />
        <div className="mt-6 flex flex-col items-end space-y-4">
          {moduleStatus === 'passed' && (
              <>
                  <div className="w-full text-center p-4 rounded-lg bg-green-50 border border-green-200">
                      <h4 className="font-bold text-green-800">¡Módulo Superado!</h4>
                      <p className="text-sm text-green-700">Has alcanzado la puntuación requerida. ¡Puedes continuar!</p>
                  </div>
                  <Button onClick={handleNextModule}>
                      {currentModuleIndex < modules.length - 1 ? 'Siguiente Módulo' : 'Finalizar Curso'}
                  </Button>
              </>
          )}
          {moduleStatus === 'failed' && (
              <>
                  <div className="w-full text-center p-4 rounded-lg bg-red-50 border border-red-200">
                      <h4 className="font-bold text-red-800">Necesitas Repasar</h4>
                      <p className="text-sm text-red-700">No has alcanzado la puntuación mínima para continuar. ¡Inténtalo de nuevo!</p>
                  </div>
                  <Button onClick={handleRetry}>
                      Volver a Intentar
                  </Button>
              </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveCourseViewer;