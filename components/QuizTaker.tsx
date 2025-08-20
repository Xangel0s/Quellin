
import React, { useState } from 'react';
import type { Quiz, QuizQuestion } from '../types';
import Button from './Button';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete?: (result: { score: number, total_questions: number }) => void;
  disabled?: boolean;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onComplete, disabled = false }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectAnswer = (questionIndex: number, optionKey: string) => {
    if (isSubmitted || disabled) return;
    setUserAnswers(prev => ({ ...prev, [questionIndex]: optionKey }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length !== quiz.length) return;
    const finalScore = calculateScore();
    setIsSubmitted(true);
    onComplete?.({ score: finalScore, total_questions: quiz.length });
  };

  const calculateScore = () => {
    return quiz.reduce((score, question, index) => {
      return userAnswers[index] === question.respuesta_correcta ? score + 1 : score;
    }, 0);
  };

  const score = isSubmitted ? calculateScore() : 0;

  const getOptionClasses = (question: QuizQuestion, optionKey: 'a' | 'b' | 'c' | 'd', questionIndex: number): string => {
    const baseClasses = "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200";
    const cursorClass = disabled || isSubmitted ? 'cursor-default' : 'cursor-pointer';

    if (isSubmitted) {
        const isCorrect = optionKey === question.respuesta_correcta;
        const isSelected = userAnswers[questionIndex] === optionKey;

        if (isCorrect) return `${baseClasses} bg-green-50 border-green-300 text-green-800 font-semibold cursor-default`;
        if (isSelected) return `${baseClasses} bg-red-50 border-red-300 text-red-800 cursor-default`;
        return `${baseClasses} bg-slate-50 border-slate-200 text-slate-600 cursor-default`;
    }
    
    if (userAnswers[questionIndex] === optionKey) {
        return `${baseClasses} bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200 ${cursorClass}`;
    }
    
    return `${baseClasses} bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 ${cursorClass}`;
  }

  return (
    <div className="space-y-6">
      {isSubmitted && (
        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
            <h3 className="text-lg font-bold text-indigo-800">¡Resultados del Intento!</h3>
            <p className="text-2xl font-bold text-indigo-600 my-2">
                {score} <span className="text-lg font-normal text-slate-600">/ {quiz.length}</span>
            </p>
            <p className="text-sm text-slate-700">Has respondido correctamente {score} de {quiz.length} preguntas.</p>
        </div>
      )}
      {quiz.map((question, index) => (
        <div key={index} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="font-semibold text-slate-800 mb-4">
            <span className="text-indigo-600 font-bold mr-2">{index + 1}.</span>
            {question.pregunta}
          </p>
          <div className="space-y-3">
            {Object.entries(question.opciones).map(([key, value]) => (
              <div
                key={key}
                className={getOptionClasses(question, key as 'a' | 'b' | 'c' | 'd', index)}
                onClick={() => handleSelectAnswer(index, key)}
              >
                <span className="font-bold text-sm uppercase">{key})</span>
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>
          {isSubmitted && (
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg text-sm">
              <p><span className="font-bold">Justificación:</span> {question.justificacion}</p>
            </div>
          )}
        </div>
      ))}
      <div className="mt-6 flex justify-end">
        {!isSubmitted && (
          <Button onClick={handleSubmit} disabled={Object.keys(userAnswers).length !== quiz.length || disabled}>
            Enviar Respuestas
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;
