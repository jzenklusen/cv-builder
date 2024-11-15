interface Experience {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

interface Education {
    degree: string;
    university: string;
    graduationYear?: string;
    gpa?: string;
  }
  
  interface Language {
    language: string;
    proficiency: string;
  }
  
  export interface CVData {
    basics: {
      name: string;
      location: string;
      email: string;
      nationalities: string;
    };
    summary: string;
    experience: any[];
    education: any[];
    skills: {
      technical: string[];
      languages: (string | Language)[];
      hobbies: string[];
    };
  }