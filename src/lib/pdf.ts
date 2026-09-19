import type { RefObject } from "react";

export const generatePDF = async (elementRef: RefObject<HTMLElement | null>, filename: string) => {
  if (typeof window === "undefined" || !elementRef.current) {
    throw new Error("PDF generation is only available in the browser");
  }
  
  try {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(elementRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2]
    });
    
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${filename}.pdf`);
  } catch (err: unknown) {
    console.error("Failed to generate PDF", err);
    throw new Error(err instanceof Error ? err.message : "Unknown error occurred during PDF generation");
  }
};
