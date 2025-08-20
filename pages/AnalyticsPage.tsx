
import React from 'react';
import type { StoredContentItem, Submission, InteractiveCourse } from '../types';
import { BarChartIcon } from '../components/icons';
import { useUI } from '../contexts/UIContext';

interface AnalyticsPageProps {
  contentItem: StoredContentItem;
  submissions: Submission[];
}

interface StudentStats {
    bestScore: number;
    totalQuestions: number;
    attempts: number;
    lastAttempt: string;
    submissions: Submission[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ contentItem, submissions }) => {
    const { navigate } = useUI();
    
    const { title, data, type } = contentItem;
    const isCourse = type === 'course';
    const courseData = isCourse ? (data as InteractiveCourse) : null;

    const totalAttempts = submissions.length;
    const averageScore = totalAttempts > 0 
        ? submissions.reduce((sum, s) => sum + (s.score / s.total_questions), 0) / totalAttempts * 100
        : 0;

    const studentData = submissions.reduce((acc, submission) => {
        const studentName = submission.student_name || 'Anonymous';
        const student = acc[studentName] || { bestScore: -1, totalQuestions: 0, attempts: 0, lastAttempt: '', submissions: [] };
        student.attempts++;
        student.submissions.push(submission);
        if (submission.score > student.bestScore) {
            student.bestScore = submission.score;
            student.totalQuestions = submission.total_questions;
        }
        if (new Date(submission.submitted_at || 0) > new Date(student.lastAttempt || 0)) {
            student.lastAttempt = submission.submitted_at || new Date().toISOString();
        }
        acc[studentName] = student;
        return acc;
    }, {} as Record<string, StudentStats>);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <button onClick={() => navigate('dashboard')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                       </svg>
                        Volver
                    </button>
                    <p className="mt-1 text-slate-600">Analizando: <span className="font-semibold">{title}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                        <BarChartIcon className="w-6 h-6 text-indigo-600"/>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Intentos Totales</p>
                        <p className="text-3xl font-bold text-slate-900">{totalAttempts}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M4.25 12.272l7.518 7.518a1.125 1.125 0 001.59 0L20.25 9.75M4.25 6.272l7.518 7.518a1.125 1.125 0 001.59 0L20.25 3.75" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Puntuación Promedio</p>
                        <p className="text-3xl font-bold text-slate-900">{averageScore.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
               <h3 className="text-xl font-semibold text-slate-800 p-6">Resultados por Estudiante</h3>
                {Object.keys(studentData).length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Estudiante</th>
                                    <th scope="col" className="px-6 py-3 text-center">Intentos</th>
                                    <th scope="col" className="px-6 py-3 text-center">Mejor Puntuación</th>
                                    <th scope="col" className="px-6 py-3">Último Intento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(studentData).sort(([, statsA], [, statsB]) => new Date(statsB.lastAttempt).getTime() - new Date(statsA.lastAttempt).getTime()).map(([name, stats]) => (
                                    <React.Fragment key={name}>
                                    <tr className="bg-white border-b hover:bg-slate-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            {name}
                                        </th>
                                        <td className="px-6 py-4 text-center">{stats.attempts}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-800">
                                            {stats.bestScore} / {stats.totalQuestions} 
                                            <span className="ml-2 text-xs font-normal text-slate-500">({(stats.bestScore/stats.totalQuestions*100).toFixed(0)}%)</span>
                                        </td>
                                        <td className="px-6 py-4">{formatDate(stats.lastAttempt)}</td>
                                    </tr>
                                    {isCourse && courseData && stats.submissions.some(s => s.module_attempts) && (
                                        <tr className="bg-slate-50/75 border-b">
                                            <td colSpan={4} className="p-0">
                                                <details className="text-xs group">
                                                    <summary className="p-2 list-none cursor-pointer text-slate-500 hover:bg-slate-100 block">
                                                        <span className="ml-4 font-semibold">
                                                            <span className="group-open:hidden">Mostrar desglose de módulos ▼</span>
                                                            <span className="hidden group-open:inline">Ocultar desglose de módulos ▲</span>
                                                        </span>
                                                    </summary>
                                                    <div className="p-4 bg-white">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {courseData.modulos.map((module, index) => {
                                                            const attemptsList = stats.submissions
                                                                .map(s => s.module_attempts ? s.module_attempts[index] : undefined)
                                                                .filter((a): a is number => a !== undefined);
                                                            
                                                            const lastAttemptCount = attemptsList.length > 0 ? attemptsList[attemptsList.length - 1] : 0;
                                                            
                                                            return (
                                                                <div key={index} className="bg-white p-3 rounded-md border border-slate-200">
                                                                    <p className="font-semibold text-slate-700 truncate text-sm" title={module.titulo}>M{index+1}: {module.titulo}</p>
                                                                    <p className={`text-xs ${lastAttemptCount > 1 ? 'text-amber-600' : 'text-green-600'} font-medium`}>
                                                                        {lastAttemptCount > 0 ? `Superado en ${lastAttemptCount} intento(s)` : 'No completado'}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                        </div>
                                                    </div>
                                                </details>
                                            </td>
                                        </tr>
                                    )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16 px-6">
                        <h4 className="text-lg font-semibold text-slate-800">Aún no hay resultados</h4>
                        <p className="text-slate-500 mt-2">Comparte tu contenido para empezar a ver las analíticas de tus estudiantes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;