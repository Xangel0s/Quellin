

import type { Quiz, InteractiveCourse, CourseModule } from '../types';
import { Difficulty } from '../types';

interface BaseParams {
  pdfTitle: string;
  selectedPages: string;
  extractedText: string;
  difficulty: Difficulty;
}

interface QuizParams extends BaseParams {
  numQuestions: number;
}

interface CourseParams extends BaseParams {
    numModules: number;
    questionsPerModule: number;
    includeModuleSummary: boolean;
    additionalInstructions?: string;
}

// Note: we call Gemini from a server-side Netlify function to avoid exposing the API key to the browser.
async function callGeminiServer(prompt: string): Promise<string> {
  const res = await fetch('/.netlify/functions/generateGemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    let bodyText = await res.text();
    try { bodyText = JSON.parse(bodyText).error || bodyText; } catch {}
    console.error('Gemini server error:', res.status, bodyText);
    throw new Error('AI service error');
  }

  const json = await res.json();
  return json.text || '';
}

function buildQuizPrompt(params: QuizParams): string {
  return `
# ROL Y OBJETIVO
Actúa como un experto diseñador de material educativo y evaluador de conocimientos. Tu objetivo principal es crear una prueba de cuestionario (quiz) rigurosa, clara y educativa a partir del texto proporcionado, siguiendo estrictamente las instrucciones y el formato de salida.

# CONTEXTO DEL MATERIAL
Analiza el siguiente texto extraído de las páginas ${params.selectedPages} del PDF titulado "${params.pdfTitle}". El texto se enfoca en los conceptos clave que deben ser evaluados.

---
${params.extractedText}
---

# TAREA Y REGLAS DE EJECUCIÓN
Basándote ÚNICAMENTE en el texto proporcionado en el [CONTEXTO], genera una prueba de cuestionario que cumpla con las siguientes reglas OBLIGATORIAS:
1.  **Número de Preguntas:** Genera exactamente ${params.numQuestions} preguntas.
2.  **Tipo de Pregunta:** Todas las preguntas deben ser de opción múltiple.
3.  **Estructura de Opciones:** Cada pregunta debe tener cuatro (4) opciones de respuesta: una (1) respuesta correcta y tres (3) distractores verosímiles.
4.  **Base en el Texto:** Cada pregunta y su respuesta correcta deben estar directamente fundamentadas en la información presente en el [CONTEXTO]. No inventes información.
5.  **Claridad y Concisión:** Las preguntas y las opciones deben ser claras y concisas.
6.  **Nivel de Dificultad:** El nivel de dificultad general del cuestionario debe ser "${params.difficulty}".
7.  **Justificación de Respuesta:** Para cada pregunta, proporciona una "justificacion" breve que explique por qué la respuesta correcta es la correcta, citando la parte del texto que la respalda.

# FORMATO DE SALIDA OBLIGATORIO
Tu respuesta debe ser únicamente un objeto JSON válido, sin ningún texto introductorio, explicaciones adicionales, o comentarios. La estructura debe ser un array de objetos, donde cada objeto representa una pregunta.

El formato debe ser el siguiente:
[
  {
    "pregunta": "Texto completo de la pregunta...",
    "opciones": {"a": "Opción A", "b": "Opción B", "c": "Opción C", "d": "Opción D"},
    "respuesta_correcta": "c",
    "justificacion": "Explicación de por qué es la respuesta correcta, basada en el texto."
  }
]
`;
}

function buildCoursePrompt(params: CourseParams): string {
    const exampleModule: Omit<CourseModule, 'cuestionario'> & { cuestionario: any[] } = {
      "titulo": "Título del Módulo 1",
      "cuestionario": [
        {
          "pregunta": "Texto de la pregunta 1 del Módulo 1...",
          "opciones": {"a": "Opción A", "b": "Opción B", "c": "Opción C", "d": "Opción D"},
          "respuesta_correcta": "c",
          "justificacion": "Explicación basada en el texto para la pregunta 1."
        }
      ]
    };

    if (params.includeModuleSummary) {
      exampleModule.resumen = "Resumen conciso del contenido del Módulo 1...";
    }
    if (params.additionalInstructions) {
        exampleModule.contexto_adicional = "Nota del creador basada en las instrucciones adicionales proporcionadas..."
    }

    const exampleJson = JSON.stringify({
        "titulo": "Título General del Curso",
        "modulos": [exampleModule],
        "propertyOrdering": ["titulo", "modulos"]
    }, null, 2);

    const contextInstruction = params.additionalInstructions 
      ? `- **\`contexto_adicional\` (OPCIONAL):** Si es relevante, añade una 'Nota del Creador' de 1-2 frases que aporte valor al módulo, basándote en las siguientes instrucciones: "${params.additionalInstructions}". Si las instrucciones no aplican al tema del módulo, omite este campo.`
      : '/* NO INCLUIR el campo `contexto_adicional` si no se han proporcionado instrucciones. */';

    return `
# ROL Y OBJETIVO
Actúa como un diseñador instruccional experto. Tu objetivo es transformar un texto complejo en un curso interactivo, claro y educativo, dividido en módulos de aprendizaje digeribles.

# CONTEXTO DEL MATERIAL
Analiza el siguiente texto extraído de las páginas ${params.selectedPages} del PDF titulado "${params.pdfTitle}".

---
${params.extractedText}
---

# TAREA Y REGLAS DE EJECUCIÓN
Basándote ÚNICAMENTE en el texto proporcionado, genera un curso interactivo que cumpla con las siguientes reglas OBLIGATORIAS:
1.  **Estructura del Curso:** Crea un objeto JSON principal con dos claves: \`titulo\` (un título general para todo el curso) y \`modulos\` (un array de objetos de módulo). Divide el contenido en exactamente ${params.numModules} módulos de aprendizaje lógicos y secuenciales. Cada módulo debe representar un concepto o tema principal del texto.
2.  **Contenido del Módulo:** Para CADA módulo en el array \`modulos\`, genera un objeto JSON con los siguientes campos:
    - **\`titulo\`**: Un título breve y descriptivo para el módulo.
    ${params.includeModuleSummary ? "- **`resumen`**: Un resumen conciso (2-4 frases) de los puntos clave del texto cubiertos en ese módulo." : "/* NO INCLUIR el campo 'resumen'. */"}
    ${contextInstruction}
    - **\`cuestionario\`**: Un pequeño cuestionario de autoevaluación con exactamente ${params.questionsPerModule} preguntas de opción múltiple.
3.  **Reglas del Cuestionario (por módulo):**
    a.  **Base en el Texto:** Las preguntas y respuestas deben estar directamente fundamentadas en la información del [CONTEXTO].
    b.  **Estructura de Opciones:** Cada pregunta debe tener cuatro (4) opciones: una (1) correcta y tres (3) distractores verosímiles.
    c.  **Justificación:** Proporciona una "justificacion" para cada pregunta, explicando por qué la respuesta es correcta según el texto.
    d.  **Dificultad:** El cuestionario debe tener una dificultad general de "${params.difficulty}".

# FORMATO DE SALIDA OBLIGATORIO
Tu respuesta debe ser únicamente un objeto JSON válido, sin ningún texto introductorio, explicaciones, ni comentarios. La estructura debe ser un objeto único con las claves \`titulo\` y \`modulos\`. ${params.includeModuleSummary ? 'Cada módulo DEBE incluir el campo `resumen`.' : 'Cada módulo NO DEBE incluir el campo `resumen`.'}

El formato JSON debe ser el siguiente:
${exampleJson}
`;
}

async function callGemini(prompt: string, isCourse: boolean = false): Promise<any> {
    try {
        const responseText = await callGeminiServer(prompt);
        const jsonText = responseText.trim();
        const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
        const data = JSON.parse(cleanedJsonText);

        if (isCourse) {
            if (typeof data !== 'object' || data === null || !Array.isArray(data.modulos)) {
                 throw new Error("La respuesta del AI para el curso no tiene el formato de objeto esperado con una clave 'modulos'.");
            }
        } else {
            if (!Array.isArray(data)) {
                throw new Error("La respuesta del AI para el cuestionario no es un array válido.");
            }
        }

        return data;

      } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof SyntaxError) {
          throw new Error("No se pudo procesar la respuesta del AI. El formato JSON era inválido.");
        }
        throw new Error(error?.message || "No se pudo comunicar con el servicio de AI. Por favor, inténtalo de nuevo más tarde.");
      }
}


export async function generateQuiz(params: QuizParams): Promise<Quiz> {
  const prompt = buildQuizPrompt(params);
  return callGemini(prompt) as Promise<Quiz>;
}

export async function generateInteractiveCourse(params: CourseParams): Promise<InteractiveCourse> {
    const prompt = buildCoursePrompt(params);
    return callGemini(prompt, true) as Promise<InteractiveCourse>;
}