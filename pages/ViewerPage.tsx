
import React, { useState, useEffect } from 'react';
import type { Quiz, InteractiveCourse, StoredContentItem, Submission, User, PublishedPost } from '../types';
import { PLANS } from '../types';
import QuizTaker from '../components/QuizTaker';
import InteractiveCourseViewer from '../components/InteractiveCourseViewer';
import Input from '../components/Input';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { QuillanLogo, UserCircleIcon, CheckIcon } from '../components/icons';
import supabase from '../services/supabase';
import { useUI } from '../contexts/UIContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface ViewerPageProps {
  contentId: string;
}

const ViewerPage: React.FC<ViewerPageProps> = ({ contentId }) => {
    const { navigate } = useUI();
    const { createSubmission } = useData();
    const { currentUser } = useAuth();

    const [content, setContent] = useState<PublishedPost | StoredContentItem | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [studentName, setStudentName] = useState('');
    const [hasStarted, setHasStarted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const fetchContentData = async () => {
            setLoading(true);
            const { data: postData } = await supabase.getPostByContentId(contentId);
            if (postData) {
                setContent(postData);
                setAuthor(postData.author);
            } else {
                const { data: contentItemData } = await supabase.getContentItemById(contentId);
                if (contentItemData) {
                    setContent(contentItemData);
                    const { data: authorData } = await supabase.getUserById(contentItemData.creator_id);
                    if (authorData) setAuthor(authorData);
                }
            }
            setLoading(false);
        };
        fetchContentData();
    }, [contentId]);

    if(loading) {
        return <div className="flex h-screen items-center justify-center"><Spinner large /></div>;
    }

    if (!content) {
        return <div className="flex h-screen items-center justify-center">Contenido no encontrado.</div>;
    }

    const actualContentItem: StoredContentItem = 'content' in content ? content.content : content;
    const { data: contentData, title, attachments } = actualContentItem;
    
    const isCourse = 'modulos' in contentData;
    const customAuthor = 'custom_author' in content ? content.custom_author : undefined;
    const showBranding = author ? !PLANS[author.profile.plan].features.customBranding : true;
    
    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        if (studentName.trim()) {
            setHasStarted(true);
        }
    }

    const handleComplete = (result: { score: number; total_questions: number; module_attempts?: Record<number, number>; }) => {
        createSubmission(actualContentItem.id, {
            student_name: studentName,
            ...result
        });
        setIsComplete(true);
    };

    const handleViewProfile = (user: User) => {
        if (currentUser) {
            navigate('profile', user);
        } else {
            alert(`Para ver perfiles, por favor inicia sesión.`);
        }
    }

    const renderContent = () => {
        if (isCourse) {
            return <InteractiveCourseViewer 
                course={contentData as InteractiveCourse} 
                attachments={attachments}
                onComplete={handleComplete} />
        }
        return <QuizTaker quiz={contentData as Quiz} onComplete={(result) => handleComplete(result)} />
    }

    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-600 rounded-lg text-white">
                      <QuillanLogo className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quillan</h1>
              </div>
               {currentUser && (
                  <button onClick={() => navigate('dashboard')} className="text-sm font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                </button>
              )}
          </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                  </div>
                    <div className="flex items-center gap-2 flex-shrink-0 rounded-lg p-2">
                      {customAuthor ? (
                        <div className="text-sm text-right">
                            <div className="font-semibold text-slate-700">{customAuthor}</div>
                            <div className="text-slate-500">Autor(a)</div>
                        </div>
                      ) : author && (
                        <button onClick={() => handleViewProfile(author)} className="flex items-center gap-2 hover:bg-slate-200 transition-colors p-2 rounded-lg -m-2">
                          <Avatar profile={author.profile} size="sm" />
                          <div className="text-sm text-left">
                            <div className="font-semibold text-slate-700">{author.profile.name}</div>
                            <div className="text-slate-500">Creador(a)</div>
                          </div>
                        </button>
                      )}
                    </div>
                </div>
                
                <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
                  {!hasStarted ? (
                    <div className="max-w-md mx-auto text-center py-8">
                      <h3 className="text-xl font-semibold text-slate-800">¡Bienvenido!</h3>
                      <p className="text-slate-600 mt-2 mb-6">Por favor, ingresa tu nombre para comenzar.</p>
                      <form onSubmit={handleStart} className="flex flex-col items-center gap-4">
                         <Input 
                            id="studentName"
                            label="Tu Nombre Completo"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Ej: Alex Doe"
                            icon={<UserCircleIcon className="w-5 h-5 text-slate-400" />}
                            className="w-full"
                            required
                         />
                         <Button type="submit" className="w-full">Comenzar</Button>
                      </form>
                    </div>
                  ) : isComplete ? (
                     <div className="text-center p-8">
                        <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                            <CheckIcon className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">¡Gracias por participar!</h2>
                        <p className="mt-2 text-slate-600">Tus resultados han sido registrados.</p>
                    </div>
                  ) : (
                    renderContent()
                  )}
                </div>

                 {showBranding && (
                  <div className="text-center mt-8">
                      <a href="#" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700">
                          Powered by <span className="font-bold">Quillan</span>
                          <QuillanLogo className="w-4 h-4 text-teal-600" />
                      </a>
                  </div>
                )}
            </div>
        </main>
      </div>
    );
};

export default ViewerPage;