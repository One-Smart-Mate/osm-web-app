import React, { useRef, useState } from "react";
import { Button } from "antd";
import { BsFilePdf } from "react-icons/bs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Strings from "../../utils/localizations/Strings";
import moment from "moment";
import { CardDetailsInterface } from "../../data/card/card";
import {
  formatDate,
  getCardStatusAndText,
  getDaysBetween,
  getDaysSince,
} from "../../utils/Extensions";
import { SiteUpdateForm } from "../../data/site/site";

interface TagPDFGeneratorProps {
  data: CardDetailsInterface;
  site?: SiteUpdateForm;
}

const TagPDFGenerator = ({ site, data }: TagPDFGeneratorProps) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { card, evidences } = data;

  const cardStatus = getCardStatusAndText(
    card.status,
    card.cardDueDate,
    card.cardDefinitiveSolutionDate,
    card.cardCreationDate
  );

  const imagesAtCreation = evidences.filter((e) => e.evidenceType == Strings.IMCR);
  const videosAtCreation = evidences.filter((e) => e.evidenceType == Strings.VICR);
  const audiosAtCreation = evidences.filter((e) => e.evidenceType == Strings.AUCR);

  const imagesAtProvisionalSolution = evidences.filter((e) => e.evidenceType == Strings.IMPS);
  const videosAtProvisionalSolution = evidences.filter((e) => e.evidenceType == Strings.VIPS);
  const audiosAtProvisionalSolution = evidences.filter((e) => e.evidenceType == Strings.AUPS);

  const imagesAtDefinitiveSolution = evidences.filter((e) => e.evidenceType == Strings.IMCL);
  const videosAtDefinitiveSolution = evidences.filter((e) => e.evidenceType == Strings.VICL);
  const audiosAtDefinitiveSolution = evidences.filter((e) => e.evidenceType == Strings.AUCL);

  const showEvidencesAtCreation = (): boolean => {
    return imagesAtCreation.length > 0 || videosAtCreation.length > 0 || audiosAtCreation.length > 0;
  };

  const showEvidencesAtProvisionalSolution = (): boolean => {
    return imagesAtProvisionalSolution.length > 0 || videosAtProvisionalSolution.length > 0 || audiosAtProvisionalSolution.length > 0;
  };

  const showEvidencesAtDefinitiveSolution = (): boolean => {
    return imagesAtDefinitiveSolution.length > 0 || videosAtDefinitiveSolution.length > 0 || audiosAtDefinitiveSolution.length > 0;
  };

  // Function to convert image URL to canvas and then to data URL
  const imageUrlToDataUrl = async (url: string): Promise<string | null> => {
    try {
      console.log('Converting image to data URL:', url);
      
      // Create a temporary image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Wait for image to load
      const imageLoaded = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => {
          console.error('Failed to load image:', url);
          resolve(false);
        };
        
        // Try with proxy first
        const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
        img.src = `${corsProxyUrl}${url}`;
        
        // Fallback to original URL after 3 seconds
        setTimeout(() => {
          if (!img.complete) {
            console.log('Trying original URL as fallback');
            img.crossOrigin = '';
            img.src = url;
          }
        }, 3000);
      });
      
      if (!imageLoaded) {
        return null;
      }
      
      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return null;
      }
      
      // Set canvas size to image size
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Successfully converted image to data URL');
      
      return dataUrl;
      
    } catch (error) {
      console.error('Error converting image to data URL:', error);
      return null;
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    setIsGenerating(true);
    
    // Set a global timeout for the entire PDF generation process
    const globalTimeout = setTimeout(() => {
      console.error('PDF generation timeout - forcing completion');
      setIsGenerating(false);
    }, 60000); // 60 second timeout
    
    try {
      console.log('Starting PDF generation...');
      
      // First, convert all Firebase images to data URLs
      const allImageUrls = [];
      
      // Collect all image URLs
      if (site?.logo) {
        allImageUrls.push(site.logo);
      }
      imagesAtCreation.forEach(img => allImageUrls.push(img.evidenceName));
      imagesAtProvisionalSolution.forEach(img => allImageUrls.push(img.evidenceName));
      imagesAtDefinitiveSolution.forEach(img => allImageUrls.push(img.evidenceName));
      
      console.log(`Converting ${allImageUrls.length} images to data URLs...`);
      
      // Convert all images to data URLs
      const imageDataUrls = new Map<string, string>();
      for (let i = 0; i < allImageUrls.length; i++) {
        const url = allImageUrls[i];
        console.log(`Converting image ${i + 1}/${allImageUrls.length}: ${url}`);
        const dataUrl = await imageUrlToDataUrl(url);
        if (dataUrl) {
          imageDataUrls.set(url, dataUrl);
          console.log(`✅ Image ${i + 1} converted successfully`);
        } else {
          console.warn(`❌ Image ${i + 1} conversion failed`);
        }
      }
      
      console.log(`Image conversion completed: ${imageDataUrls.size}/${allImageUrls.length} successful`);
      
      // Show the hidden element temporarily
      const element = pdfRef.current;
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.left = '-9999px';
      element.style.width = '794px'; // A4 width in pixels at 96 DPI
      element.style.backgroundColor = 'white';

      // Replace all image URLs with data URLs
      const images = element.querySelectorAll('img');
      console.log('Found images in DOM:', images.length);
      
      images.forEach((img, index) => {
        const originalSrc = img.getAttribute('data-original-url') || img.src;
        // Extract original URL from proxy URL if needed
        let actualUrl = originalSrc;
        if (originalSrc.includes('cors-anywhere.herokuapp.com/')) {
          actualUrl = originalSrc.replace('https://cors-anywhere.herokuapp.com/', '');
        }
        
        const dataUrl = imageDataUrls.get(actualUrl);
        if (dataUrl) {
          img.src = dataUrl;
          console.log(`✅ Replaced image ${index + 1} with data URL`);
        } else {
          console.warn(`❌ No data URL found for image ${index + 1}: ${actualUrl}`);
        }
      });
      
      // Wait a moment for DOM to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Generating canvas...');

      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: false, // Disable CORS to avoid taint issues
        allowTaint: true, // Allow tainted canvas
        backgroundColor: '#ffffff',
        width: 794, // A4 width
        logging: false, // Disable logging to reduce noise
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          // Modify cloned document if needed
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach(img => {
            img.crossOrigin = '';
            img.removeAttribute('crossorigin');
          });
        }
      });

      console.log('Canvas generated, creating PDF...');

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let currentHeight = 0;
      let pageHeight = pdfHeight;
      
      // Add pages as needed
      while (currentHeight < imgHeight) {
        const sourceY = (currentHeight * canvas.width) / pdfWidth;
        const sourceHeight = Math.min(
          (pageHeight * canvas.width) / pdfWidth,
          canvas.height - sourceY
        );
        
        // Create canvas for current page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
          
          if (currentHeight > 0) {
            pdf.addPage();
          }
          
          const currentPageHeight = Math.min(pageHeight, imgHeight - currentHeight);
          pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, currentPageHeight);
        }
        
        currentHeight += pageHeight;
      }

      // Save the PDF
      pdf.save(`TAG_${data.card.siteCardId}.pdf`);
      
      console.log('PDF generated successfully!');

      // Hide the element again
      element.style.display = 'none';
      
      // Clear the global timeout since we completed successfully
      clearTimeout(globalTimeout);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      clearTimeout(globalTimeout);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        type="primary" 
        icon={<BsFilePdf />} 
        onClick={generatePDF}
        loading={isGenerating}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generando PDF... (Puede tomar hasta 1 min)' : Strings.sharePDF}
      </Button>

      {/* Hidden HTML content for PDF generation */}
      <div ref={pdfRef} style={{ display: 'none' }}>
        <div style={{ 
          fontFamily: 'Arial, sans-serif', 
          padding: '20px', 
          backgroundColor: 'white',
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
                {site?.name || 'Site Name'}
              </h1>
              {site?.address && site.phone && (
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.companyAddress}: </span>
                    <span style={{ color: '#8c8c8c' }}>{site.address}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.phone}: </span>
                    <span style={{ color: '#8c8c8c' }}>{site.phone}</span>
                  </div>
                </div>
              )}
            </div>
            {site?.logo && (
              <img 
                src={site.logo}
                data-original-url={site.logo}
                alt="Logo" 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50px',
                  objectFit: 'cover'
                }}
              />
            )}
          </div>

          {/* Divider - Tag Details */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
            <span style={{ margin: '0 8px', fontSize: '16px', fontWeight: '600' }}>{Strings.tagDetails}</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
          </div>

          {/* Tag Information Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.tagNumber}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.siteCardId || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.cardType}: </span>
              <span style={{ color: `#${card.cardTypeColor}`, fontWeight: 'bold' }}>
                {card.cardTypeName || Strings.NA}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.status}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.status || Strings.NA}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.creationDate}: </span>
              <span style={{ color: '#8c8c8c' }}>{formatDate(card.createdAt) || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.createdBy}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.creatorName || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.daysSinceCreation}: </span>
              <span style={{ color: '#8c8c8c' }}>{getDaysSince(card.createdAt) || Strings.cero}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.dueDate}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.cardDueDate || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.priority}: </span>
              <span style={{ color: '#8c8c8c' }}>
                {card.priorityCode ? `${card.priorityCode} - ${card.priorityDescription}` : Strings.NA}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.dateStatus}: </span>
              <span style={{ 
                color: cardStatus.dateStatus === Strings.expired ? '#ff4d4f' : '#73d13d',
                fontWeight: 'bold'
              }}>
                {cardStatus.dateStatus}
              </span>
            </div>
          </div>

          {/* Problem Details */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
            <span style={{ margin: '0 8px', fontSize: '16px', fontWeight: '600' }}>{Strings.problemDetails}</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.problemType}: </span>
              <span style={{ color: '#8c8c8c' }}>
                {card.preclassifierCode ? `${card.preclassifierCode} - ${card.preclassifierDescription}` : Strings.NA}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.location}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.cardLocation || Strings.NA}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.mechanic}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.mechanicName || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.anomalyDetected}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.commentsAtCardCreation || Strings.NA}</span>
            </div>
          </div>

          {/* Provisional Solution */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
            <span style={{ margin: '0 8px', fontSize: '16px', fontWeight: '600' }}>{Strings.provisionalSolution}</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.tagDate}: </span>
              <span style={{ color: '#8c8c8c' }}>{formatDate(card.cardProvisionalSolutionDate) || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.tagDays}: </span>
              <span style={{ color: '#8c8c8c' }}>
                {getDaysBetween(card.createdAt, card.cardProvisionalSolutionDate) || Strings.ceroDays}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.appProvisionalUser}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.userAppProvisionalSolutionName || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.provisionalUser}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.userProvisionalSolutionName || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.provisionalSoluitonApplied}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.commentsAtCardProvisionalSolution || Strings.NA}</span>
            </div>
          </div>

          {/* Definitive Solution */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
            <span style={{ margin: '0 8px', fontSize: '16px', fontWeight: '600' }}>{Strings.definitiveSolution}</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.tagDate}: </span>
              <span style={{ color: '#8c8c8c' }}>{formatDate(card.cardDefinitiveSolutionDate) || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.tagDays}: </span>
              <span style={{ color: '#8c8c8c' }}>
                {getDaysBetween(card.createdAt, card.cardDefinitiveSolutionDate) || Strings.ceroDays}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.appDefinitiveUser}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.userAppDefinitiveSolutionName || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.definitiveUser}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.userDefinitiveSolutionName || Strings.NA}</span>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#595959' }}>{Strings.definitiveSolutionApplied}: </span>
              <span style={{ color: '#8c8c8c' }}>{card.commentsAtCardDefinitiveSolution || Strings.NA}</span>
            </div>
          </div>

          {/* Timestamp */}
          <div style={{ marginTop: '20px', color: '#8c8c8c', fontSize: '10px' }}>
            {moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}
          </div>

          {/* Evidence Sections */}
          {showEvidencesAtCreation() && (
            <div style={{ pageBreakBefore: 'always', padding: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
                <span style={{ margin: '0 8px', fontSize: '16px', fontWeight: '600' }}>{Strings.evidencesAtCreationDivider}</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
              </div>

              {imagesAtCreation.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.images}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
                    {imagesAtCreation.map((value, index) => (
                      <img
                        key={index}
                                                src={value.evidenceName}
                        data-original-url={value.evidenceName}
                        alt={`Evidence ${index + 1}`}
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {videosAtCreation.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.videos}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {videosAtCreation.map((value, index) => (
                      <div key={index} style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px',
                        color: '#1890ff',
                        textDecoration: 'underline'
                      }}>
                        VIDEO_{index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {audiosAtCreation.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.audios}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {audiosAtCreation.map((value, index) => (
                      <div key={index} style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px',
                        color: '#1890ff',
                        textDecoration: 'underline'
                      }}>
                        AUDIO_{index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showEvidencesAtProvisionalSolution() && (
            <div style={{ pageBreakBefore: 'always', padding: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
                <span style={{ margin: '0 8px', fontSize: '16px', fontWeight: '600' }}>{Strings.evidencesAtProvisionalDivider}</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
              </div>

              {imagesAtProvisionalSolution.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.images}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
                    {imagesAtProvisionalSolution.map((value, index) => (
                      <img
                        key={index}
                                                src={value.evidenceName}
                        data-original-url={value.evidenceName}
                        alt={`Evidence ${index + 1}`}
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {videosAtProvisionalSolution.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.videos}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {videosAtProvisionalSolution.map((value, index) => (
                      <div key={index} style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px',
                        color: '#1890ff',
                        textDecoration: 'underline'
                      }}>
                        VIDEO_{index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {audiosAtProvisionalSolution.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.audios}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {audiosAtProvisionalSolution.map((value, index) => (
                      <div key={index} style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px',
                        color: '#1890ff',
                        textDecoration: 'underline'
                      }}>
                        AUDIO_{index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showEvidencesAtDefinitiveSolution() && (
            <div style={{ pageBreakBefore: 'always', padding: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
                <span style={{ margin: '0 8px', fontSize: '16px', fontWeight: '600' }}>{Strings.evidencesAtDefinitiveDivider}</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#8c8c8c' }}></div>
              </div>

              {imagesAtDefinitiveSolution.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.images}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
                    {imagesAtDefinitiveSolution.map((value, index) => (
                      <img
                        key={index}
                                                src={value.evidenceName}
                        data-original-url={value.evidenceName}
                        alt={`Evidence ${index + 1}`}
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {videosAtDefinitiveSolution.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.videos}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {videosAtDefinitiveSolution.map((value, index) => (
                      <div key={index} style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px',
                        color: '#1890ff',
                        textDecoration: 'underline'
                      }}>
                        VIDEO_{index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {audiosAtDefinitiveSolution.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                    <span style={{ margin: '0 8px', fontSize: '12px', fontWeight: '600' }}>{Strings.audios}</span>
                    <div style={{ flex: 1, height: '0.5px', backgroundColor: '#8c8c8c' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {audiosAtDefinitiveSolution.map((value, index) => (
                      <div key={index} style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px',
                        color: '#1890ff',
                        textDecoration: 'underline'
                      }}>
                        AUDIO_{index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TagPDFGenerator;
