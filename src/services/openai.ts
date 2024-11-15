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
  experience: `Eres un redactor profesional de CV con experiencia en transcribir información verbal a datos estructurados de CV. Dada la siguiente descripción verbal de la experiencia laboral de alguien, crea un objeto JSON bien estructurado y profesional con los siguientes campos:
  - **jobTitle:** El título oficial del puesto (ej., "Ingeniero de Software").
  - **company:** El nombre exacto de la empresa (ej., "Procter and Gamble").
  - **startDate:** Fecha de inicio del empleo (ej., "Enero 2020").
  - **endDate:** Fecha de finalización del empleo o "Presente" si está empleado actualmente.
  - **location:** Ciudad y país del empleo (ej., "Madrid, España").
  - **responsibilities:** Un array de 3-4 puntos detallando responsabilidades y logros clave.

**Ejemplo:**

# Input:
Trabajé como Desarrollador Senior en Procter and Gamble desde marzo 2018 hasta junio 2021 en Madrid. Lideré un equipo de 5 desarrolladores, implementé nuevas funcionalidades que aumentaron la participación de usuarios en un 20%, y optimicé procesos backend para reducir costos de servidor en un 15%.

# Output JSON:
{
  "jobTitle": "Desarrollador Senior",
  "company": "Procter and Gamble",
  "startDate": "Marzo 2018",
  "endDate": "Junio 2021",
  "location": "Madrid, España",
  "responsibilities": [
    "Lideré un equipo de 5 desarrolladores para entregar soluciones de software de alta calidad.",
    "Implementé nuevas funcionalidades que aumentaron la participación de usuarios en un 20%.",
    "Optimicé procesos backend para reducir costos de servidor en un 15%."
  ]
}

# Ahora, procesa la siguiente entrada:

# Input:
{{text}}

# Output JSON:`,

  education: `Eres un redactor profesional de CV. Dada una descripción verbal de la educación de alguien, crea un objeto JSON bien estructurado y profesional con los siguientes campos:
  - **degree:** Nombre del título (ej., "Grado en Ingeniería Informática").
  - **university:** Nombre de la universidad (ej., "Universidad Complutense de Madrid").
  - **graduationYear:** Año de graduación (ej., "2022").
  - **gpa:** Nota media si se menciona (ej., "8.5/10").

**Ejemplo:**

# Input:
Obtuve mi Grado en Ingeniería Informática de la Universidad Complutense de Madrid en 2022 con una nota media de 8.5/10.

# Output JSON:
{
  "degree": "Grado en Ingeniería Informática",
  "university": "Universidad Complutense de Madrid",
  "graduationYear": "2022",
  "gpa": "8.5/10"
}

# Ahora, procesa la siguiente entrada:

# Input:
{{text}}

# Output JSON:`,

  skills: `Eres un redactor profesional de CV. Dada una descripción verbal de las habilidades, idiomas y aficiones de alguien, organízalos en categorías estructuradas. Crea un objeto JSON bien formateado con los siguientes campos:
  - **technical:** Un array de habilidades técnicas (ej., ["JavaScript", "React", "Node.js"]).
  - **languages:** Un array de idiomas con niveles de competencia (ej., [{"language": "Español", "proficiency": "Nativo"}, {"language": "Inglés", "proficiency": "Intermedio"}]).
  - **hobbies:** Un array de aficiones e intereses (ej., ["Fotografía", "Ciclismo"]).

**Ejemplo:**

# Input:
Tengo experiencia en JavaScript, React y Node.js. Hablo español (nativo) e inglés (intermedio). En mi tiempo libre, disfruto de la fotografía y el ciclismo.

# Output JSON:
{
  "technical": ["JavaScript", "React", "Node.js"],
  "languages": [
    { "language": "Español", "proficiency": "Nativo" },
    { "language": "Inglés", "proficiency": "Intermedio" }
  ],
  "hobbies": ["Fotografía", "Ciclismo"]
}

# Ahora, procesa la siguiente entrada:

# Input:
{{text}}

# Output JSON:`,
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
    console.error('Empty text provided to enhanceText');
    return section === 'skills'
      ? { technical: [], languages: [], hobbies: [] }
      : {};
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: SECTION_PROMPTS[section] + '\nIMPORTANT: Respond only with valid JSON.' 
        },
        { role: 'user', content: text },
      ],
      model: 'gpt-4-turbo-preview',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content || '{}';
    const result = JSON.parse(content);

/////////////////////////////////////////////////////////

    const requiredFields = {
      experience: ['jobTitle', 'company', 'startDate', 'endDate', 'location', 'responsibilities'],
      education: ['degree', 'university', 'graduationYear', 'gpa'],
      skills: ['technical', 'languages', 'hobbies'],
    };

    const missingFields = requiredFields[section].filter(
      (field) => !(field in result)
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing fields in AI response: ${missingFields.join(', ')}`);
    }

    console.log(`Enhanced ${section} result:`, result);
    return result;
  } catch (error) {
    console.error('Error enhancing text:', error);
    throw error;
  }
};