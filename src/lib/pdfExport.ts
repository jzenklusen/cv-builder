export const exportToPDF = async (elementId: string, filename: string) => {
  if (typeof window === 'undefined') {
    console.error('This function can only be used in the browser');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const html2pdf = (await import('html2pdf.js')).default;

    const options = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};