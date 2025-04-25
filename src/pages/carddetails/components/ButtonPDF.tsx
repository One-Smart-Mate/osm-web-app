import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Strings from "../../../utils/localizations/Strings";
import { Button } from "antd";

interface ExportPdfButtonProps {
  targetId: string;
  filename?: string;
  cardNumber?: string;
}

const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({
  targetId,
  filename = "document.pdf",
  cardNumber = "",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const exportPDF = async (): Promise<void> => {
    setIsGenerating(true);
    const input = document.getElementById(targetId);

    if (!input) {
      console.error(`Element with id '${targetId}' not found`);
      setIsGenerating(false);
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(input, {
        useCORS: true,
        logging: false,
        background: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.7);

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;

      while (position < imgHeight) {
        if (position > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "JPEG", 0, -position, imgWidth, imgHeight);
        position += pdfHeight;
      }
      
      let finalFilename = filename;
      if (cardNumber) {
        const baseFilename = filename.replace(/\.pdf$/i, "");
        finalFilename = `${baseFilename} ${cardNumber}.pdf`;
      }
      
      pdf.save(finalFilename);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={exportPDF}
      type="primary"
      size="large"
      loading={isGenerating}
    >      {Strings.sharePDF}
</Button>
  );
};

export default ExportPdfButton;
