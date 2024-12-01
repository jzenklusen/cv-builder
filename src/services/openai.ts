import { CVData } from '@/types/cv';
import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const SECTION_PROMPTS = {
  experience: `Eres un redactor profesional de CV con experiencia en transcribir información verbal a datos estructurados de CV. 
Por favor, convierte la siguiente descripción verbal de experiencia laboral en un objeto JSON con TODOS estos campos obligatorios:

{
  "jobTitle": "título del puesto",
  "company": "nombre de la empresa",
  "startDate": "fecha de inicio (ej: Enero 2020)",
  "endDate": "fecha de fin o 'Presente'",
  "location": "ubicación",
  "responsibilities": ["responsabilidad 1", "responsabilidad 2", ...]
}

Si algún dato no está especificado en la entrada, usa un valor por defecto apropiado.
Si no puedes entender alguna parte, indica "por especificar" en ese campo.
IMPORTANTE: SIEMPRE debes devolver un objeto JSON válido con TODOS los campos mencionados.

Entrada del usuario:
{{text}}

Respuesta (solo JSON):`,

  education: `Eres un redactor profesional de CV con experiencia en transcribir información verbal a datos estructurados.
Por favor, convierte la siguiente descripción verbal de educación en un objeto JSON con TODOS estos campos obligatorios:

{
  "degree": "nombre del título",
  "university": "nombre de la universidad",
  "graduationYear": "año de graduación",
  "gpa": "promedio (si se menciona)"
}

Si algún dato no está especificado en la entrada, usa un valor por defecto apropiado.
Si no puedes entender alguna parte, indica "por especificar" en ese campo.
IMPORTANTE: SIEMPRE debes devolver un objeto JSON válido con TODOS los campos mencionados.

Entrada del usuario:
{{text}}

Respuesta (solo JSON):`,

  skills: `Eres un redactor profesional de CV con experiencia en transcribir información verbal a datos estructurados.
Por favor, convierte la siguiente descripción verbal de habilidades en un objeto JSON con TODOS estos campos obligatorios:

{
  "technical": ["habilidad1", "habilidad2", ...],
  "languages": [
    {"language": "idioma1", "proficiency": "nivel1"},
    {"language": "idioma2", "proficiency": "nivel2"}
  ],
  "hobbies": ["hobby1", "hobby2", ...]
}

Si no se mencionan habilidades de algún tipo, usa un array vacío.
IMPORTANTE: SIEMPRE debes devolver un objeto JSON válido con TODOS los campos mencionados.

Entrada del usuario:
{{text}}

Respuesta (solo JSON):`,
};

const SUMMARY_PROMPT = `Eres un redactor profesional de CV con experiencia en crear resúmenes ejecutivos impactantes. 
Dada la siguiente información estructurada de un CV, crea un resumen profesional conciso (máximo 4 líneas) que destaque:
- Perfil profesional general
- Principales logros y experiencia
- Habilidades técnicas y blandas más relevantes
- Elementos diferenciadores

El resumen debe seguir este formato:
"Perfil [adjetivos relevantes] con experiencia en [áreas principales]. [Logros específicos o experiencia destacada]. [Habilidades técnicas relevantes] complementadas con [habilidades blandas]. [Elemento diferenciador o especialización única]."

Ejemplo de formato:
"Perfil analítico y estratégico con experiencia en consultoría de negocio y transformación digital. Historial probado liderando proyectos internacionales que generaron ahorros de $2M+ y mejoras de eficiencia del 40%. Sólidas habilidades en Python y análisis de datos complementadas con liderazgo de equipos multiculturales. Especialización única en la integración de metodologías ágiles en entornos tradicionales."

Input JSON:
{{cvData}}

Output:
[Genera solo el resumen, sin formato JSON ni campos adicionales]`;

/////////////////////////////////////////////////////////
export const generateCVSummary = async (cvData: CVData): Promise<string> => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: SUMMARY_PROMPT.replace('{{cvData}}', JSON.stringify(cvData, null, 2))
          }
        ],
        model: 'gpt-4-turbo-preview',
      });
  
      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating CV summary:', error);
      throw error;
    }
  };

export const enhanceText = async (
  text: string,
  section: 'experience' | 'education' | 'skills'
): Promise<any> => {
  if (!text.trim()) {
    throw new Error('No se proporcionó texto para procesar');
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: SECTION_PROMPTS[section].replace('{{text}}', text)
        }
      ],
      model: 'gpt-4-turbo-preview',
      response_format: { type: 'json_object' },
      temperature: 0.5, // Reducimos la creatividad para respuestas más consistentes
    });

    const content = completion.choices[0].message.content || '{}';
    let result;
    
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('Error parsing OpenAI response:', content);
      throw new Error('La respuesta no es un JSON válido');
    }

    // Validación específica por sección
    if (section === 'experience') {
      if (!result.jobTitle || !result.company || !result.startDate || 
          !result.endDate || !result.location || !Array.isArray(result.responsibilities)) {
        throw new Error('Respuesta incompleta para experiencia laboral');
      }
    } else if (section === 'education') {
      if (!result.degree || !result.university || !result.graduationYear) {
        throw new Error('Respuesta incompleta para educación');
      }
    } else if (section === 'skills') {
      if (!Array.isArray(result.technical) || !Array.isArray(result.languages) || !Array.isArray(result.hobbies)) {
        throw new Error('Respuesta incompleta para habilidades');
      }
    }

    return result;
  } catch (error) {
    console.error('Error en enhanceText:', error);
    throw new Error('No se pudo procesar el texto. Por favor, intenta ser más específico.');
  }
};