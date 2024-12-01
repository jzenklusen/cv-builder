import html2pdf from 'html2pdf.js';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  const options = {
    margin: 15,
    filename: filename,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true,
      precision: 16
    }
  };

  try {
    await html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};