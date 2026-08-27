import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async (elementRef: React.RefObject<HTMLElement>, filename: string) => {
  if (!elementRef.current) return;
  
  try {
    const canvas = await html2canvas(elementRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2]
    });
    
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${filename}.pdf`);
  } catch (err: any) {
    console.error("Failed to generate PDF", err);
    throw new Error(err?.message || "Unknown error occurred during PDF generation");
  }
};
