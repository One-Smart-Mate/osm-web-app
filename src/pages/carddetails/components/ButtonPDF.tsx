import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AnatomyButton from "../../../components/AnatomyButton";
import Strings from "../../../utils/localizations/Strings";

interface ExportPdfButtonProps {
  targetId: string; // ID of the element you want to convert to PDF
  filename?: string; // Optional name for the PDF file
}

const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({ targetId, filename = "document.pdf" }) => {
  const exportPDF = (): void => {
    const input = document.getElementById(targetId);
    if (input) {
      html2canvas(input, { logging: true, useCORS: true }).then((canvas) => {
        const imgWidth = 208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(filename);
      });
    } else {
      console.error(`Element with id '${targetId}' not found`);

    }
  };

  return <AnatomyButton
    title={Strings.sharePDF}
    onClick={exportPDF}
    type="default"
    size="large"
  />

};

export default ExportPdfButton;
