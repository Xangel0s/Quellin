
import React from 'react';
import { useState } from 'react';
import { generateQuiz, generateInteractiveCourse } from '../services/geminiService';
import type { Quiz, InteractiveCourse, Attachment } from '../types';
import { Difficulty, PLANS } from '../types';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Select from '../components/Select';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ModeSelector from '../components/ModeSelector';
import Checkbox from '../components/Checkbox';
import GeneratorAttachments from '../components/GeneratorAttachments';
import { BookOpenIcon, HashtagIcon, BarChartIcon, QuillanLogo, UploadIcon, AcademicCapIcon } from '../components/icons';
import * as pdfjsLib from 'pdfjs-dist';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs';

type GenerationMode = 'quiz' | 'course';

const GeneratorPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { contentItems, createContentItem } = useData();
  const { navigate, openUpgradeModal } = useUI();
  
  if (!currentUser) {
    navigate('dashboard');
    return null;
  }

  const userPlan = PLANS[currentUser.profile.plan];
  const contentCount = contentItems.length;

  // Form State
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [numModules, setNumModules] = useState<number>(3);
  const [questionsPerModule, setQuestionsPerModule] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Intermediate);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('quiz');
  const [includeModuleSummary, setIncludeModuleSummary] = useState<boolean>(true);
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [addCertificate, setAddCertificate] = useState<boolean>(false);

  // App Status State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setPdfTitle(file.name.replace(/\.pdf$/i, ''));
    setExtractedText('');
    setError(null);
    setIsParsing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      let fullText = '';
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
        fullText += pageText + '\n\n';
      }
      setExtractedText(fullText.trim());
    } catch (err) {
      setError('Error al procesar el archivo PDF. Asegúrate de que es un archivo válido.');
      console.error(err);
      setPdfFile(null);
      setPdfTitle('');
    } finally {
      setIsParsing(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contentCount >= userPlan.limits.content) {
        openUpgradeModal('Crear más contenido', 'pro');
        return;
    }

    setIsLoading(true);
    setError(null);

    if (!extractedText.trim()) {
      setError('El texto para analizar no puede estar vacío. Sube un PDF o pégalo manualmente.');
      setIsLoading(false);
      return;
    }

    try {
       let generatedContent: Quiz | InteractiveCourse;
       let title: string;

       if (generationMode === 'quiz') {
        generatedContent = await generateQuiz({
          pdfTitle: pdfTitle || 'Documento Personalizado',
          selectedPages: 'N/A',
          extractedText,
          numQuestions,
          difficulty,
        });
        title = pdfTitle || 'Cuestionario sin título';
      } else {
        generatedContent = await generateInteractiveCourse({
          pdfTitle: pdfTitle || 'Documento Personalizado',
          selectedPages: 'N/A',
          extractedText,
          numModules,
          questionsPerModule,
          difficulty,
          includeModuleSummary,
          additionalInstructions,
        });
        title = generatedContent.titulo || pdfTitle || 'Curso sin título';
      }
      await createContentItem(title, generatedContent, attachments, addCertificate);
      navigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al generar el contenido.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const canAddCertificate = userPlan.features.certificates && (currentUser.profile.plan !== 'free' || currentUser.profile.certificate_uses_left > 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-20">
                <Spinner large className="text-teal-600" />
                <p className="mt-4 text-lg font-medium">Generando contenido...</p>
                <p className="text-sm">El modelo AI está trabajando. Esto puede tardar unos segundos.</p>
            </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <ModeSelector selectedMode={generationMode} onSelectMode={setGenerationMode} />
             <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Fuente del Texto</label>
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
                    <label htmlFor="pdf-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-400 rounded-md font-semibold text-xs text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                        <UploadIcon className="w-4 h-4" />
                        <span>{pdfFile ? 'Cambiar PDF' : 'Subir PDF'}</span>
                    </label>
                    <input id="pdf-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" disabled={isParsing || isLoading} />
                    {pdfFile && !isParsing && <p className="text-sm text-slate-600 mt-2">{pdfFile.name}</p>}
                    {isParsing && (
                        <div className="flex items-center justify-center text-sm text-teal-600 mt-2">
                            <Spinner className="text-teal-600" />
                            <span className="ml-2">Extrayendo texto...</span>
                        </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">O pega el texto directamente abajo.</p>
                </div>
            </div>
            <Textarea
              id="extractedText"
              label="Texto para Analizar"
              value={extractedText}
              onChange={(e) => {
                setExtractedText(e.target.value);
                setPdfFile(null);
              }}
              placeholder="Sube un PDF o pega aquí el texto..."
              rows={8}
              readOnly={isParsing}
            />
            <Input
              id="pdfTitle"
              label="Título del Material"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              placeholder="Ej: Introducción a la IA"
              icon={<BookOpenIcon className="w-5 h-5 text-slate-400" />}
            />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {generationMode === 'quiz' ? (
                <Input
                  id="numQuestions"
                  label="Número de Preguntas"
                  type="number"
                  value={numQuestions.toString()}
                  onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10)) || 1)}
                  min="1"
                  icon={<HashtagIcon className="w-5 h-5 text-slate-400" />}
                />
              ) : (
                <>
                   <Input
                    id="numModules"
                    label="Número de Módulos"
                    type="number"
                    value={numModules.toString()}
                    onChange={(e) => setNumModules(Math.max(1, parseInt(e.target.value, 10)) || 1)}
                    min="1"
                    icon={<AcademicCapIcon className="w-5 h-5 text-slate-400" />}
                  />
                   <Input
                    id="questionsPerModule"
                    label="Preguntas por Módulo"
                    type="number"
                    value={questionsPerModule.toString()}
                    onChange={(e) => setQuestionsPerModule(Math.max(1, parseInt(e.target.value, 10)) || 1)}
                    min="1"
                    icon={<HashtagIcon className="w-5 h-5 text-slate-400" />}
                  />
                </>
              )}
               <Select
                id="difficulty"
                label="Nivel de Dificultad"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                options={Object.values(Difficulty)}
                icon={<BarChartIcon className="w-5 h-5 text-slate-400" />}
              />
            </div>

            {generationMode === 'course' && (
                <div className='space-y-6 pt-6 border-t border-slate-200'>
                    <div className="space-y-4">
                        <Checkbox
                            id="includeSummary"
                            label="Incluir resumen en cada módulo"
                            checked={includeModuleSummary}
                            onChange={(e) => setIncludeModuleSummary(e.target.checked)}
                        />
                        <Textarea
                            id="additionalInstructions"
                            label="Contexto Adicional para Módulos (Opcional)"
                            value={additionalInstructions}
                            onChange={(e) => setAdditionalInstructions(e.target.value)}
                            placeholder="Ej: 'Enfatiza la importancia de las fechas clave' o 'Pide a los estudiantes que reflexionen sobre las implicaciones éticas'."
                            rows={3}
                        />
                    </div>
                    <GeneratorAttachments attachments={attachments} setAttachments={setAttachments} />
                </div>
            )}

            <div className='pt-6 border-t border-slate-200'>
                 <h3 className="text-lg font-semibold text-slate-800 mb-2">Opciones Adicionales</h3>
                 <div className="p-4 bg-slate-50 rounded-lg">
                    {canAddCertificate ? (
                         <Checkbox
                            id="addCertificate"
                            label={`Añadir Certificado de Finalización ${currentUser.profile.plan === 'free' ? `(1 uso restante)` : ''}`}
                            checked={addCertificate}
                            onChange={(e) => setAddCertificate(e.target.checked)}
                        />
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Añadir Certificado de Finalización</p>
                            <Button type="button" onClick={() => openUpgradeModal('Certificados ilimitados', 'pro')} className="!py-1 !px-3 !text-xs">
                                Actualizar Plan
                            </Button>
                        </div>
                    )}
                 </div>
            </div>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
            )}
            <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-200">
                <Button type="button" onClick={() => navigate('dashboard')} className="!bg-slate-200 !text-slate-800 hover:!bg-slate-300">
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || isParsing}>
                    <QuillanLogo className="w-5 h-5 mr-2"/>
                    Generar Contenido
                </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GeneratorPage;