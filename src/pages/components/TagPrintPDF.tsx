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

interface TagPrintPDFProps {
  data: CardDetailsInterface;
  site?: SiteUpdateForm;
}

const TagPrintPDF = ({ site, data }: TagPrintPDFProps) => {
  const printRef = useRef<HTMLDivElement>(null);
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

  const generatePDF = async () => {
    if (!printRef.current) return;

    setIsGenerating(true);
    
    try {
      console.log('Opening automated print window...');
      
      // Create a centered window for printing
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const windowWidth = 800;
      const windowHeight = 600;
      const left = (screenWidth - windowWidth) / 2;
      const top = (screenHeight - windowHeight) / 2;
      
      const printWindow = window.open('', '_blank', `width=${windowWidth},height=${windowHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`);
      
      if (!printWindow) {
        console.error('Failed to open print window');
        return;
      }

      // Get the content to print
      const printContent = printRef.current?.innerHTML || '';
      
      // Create print-optimized HTML with auto-download script
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>TAG_${data.card.siteCardId}</title>
            <meta charset="UTF-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
                background: white;
              }
              
              @page {
                size: A4;
                margin: 15mm;
              }
              
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                .page-break {
                  page-break-before: always;
                }
                
                .no-page-break {
                  page-break-inside: avoid;
                }
                
                img {
                  max-width: 100% !important;
                  height: auto !important;
                  page-break-inside: avoid;
                }
              }
              
              .header-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
              }
              
              .site-info h1 {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 16px;
              }
              
              .site-info .info-row {
                margin-bottom: 8px;
              }
              
              .site-info .label {
                font-weight: 600;
                color: #595959;
              }
              
              .site-info .value {
                color: #8c8c8c;
              }
              
              .logo {
                width: 100px;
                height: 100px;
                border-radius: 50px;
                object-fit: cover;
              }
              
              .divider {
                display: flex;
                align-items: center;
                margin: 20px 0;
              }
              
              .divider .line {
                flex: 1;
                height: 1px;
                background-color: #8c8c8c;
              }
              
              .divider .text {
                margin: 0 8px;
                font-size: 16px;
                font-weight: 600;
              }
              
              .divider-small {
                display: flex;
                align-items: center;
                margin: 16px 0;
              }
              
              .divider-small .line {
                flex: 1;
                height: 0.5px;
                background-color: #8c8c8c;
              }
              
              .divider-small .text {
                margin: 0 8px;
                font-size: 12px;
                font-weight: 600;
              }
              
              .info-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 16px;
              }
              
              .info-grid.two-cols {
                grid-template-columns: repeat(2, 1fr);
              }
              
              .info-grid.border-bottom {
                border-bottom: 1px solid #f0f0f0;
              }
              
              .info-item .label {
                font-weight: 600;
                color: #595959;
              }
              
              .info-item .value {
                color: #8c8c8c;
              }
              
              .status-badge {
                display: inline-block;
                color: white;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 2px;
                font-size: 10px;
              }
              
              .timestamp {
                margin-top: 20px;
                color: #8c8c8c;
                font-size: 10px;
              }
              
              .evidence-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: flex-start;
                margin-bottom: 20px;
              }
              
              .evidence-image {
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: 4px;
                border: 1px solid #ddd;
              }
              
              .evidence-link {
                padding: 8px 12px;
                background-color: #f5f5f5;
                border-radius: 4px;
                color: #1890ff;
                text-decoration: underline;
                font-size: 11px;
              }
            </style>
          </head>
          <body>
            <div class="print-content">
              ${printContent}
            </div>
            <script>
              let imagesLoaded = false;
              let printAttempted = false;
              
              function attemptPrint() {
                if (printAttempted) return;
                printAttempted = true;
                
                console.log('Attempting automated print...');
                
                // Try to automatically trigger print dialog
                setTimeout(() => {
                  window.print();
                  
                  // Auto-close after print dialog
                  setTimeout(() => {
                    window.close();
                  }, 1000);
                }, 500);
              }
              
              window.onload = function() {
                console.log('Print window loaded');
                
                // Wait for images to load
                const images = document.querySelectorAll('img');
                let loadedImages = 0;
                const totalImages = images.length;
                
                console.log('Found images:', totalImages);
                
                if (totalImages === 0) {
                  imagesLoaded = true;
                  attemptPrint();
                  return;
                }
                
                function checkImagesLoaded() {
                  loadedImages++;
                  console.log('Image loaded:', loadedImages, '/', totalImages);
                  
                  if (loadedImages >= totalImages) {
                    imagesLoaded = true;
                    attemptPrint();
                  }
                }
                
                images.forEach((img, index) => {
                  if (img.complete) {
                    checkImagesLoaded();
                  } else {
                    img.onload = checkImagesLoaded;
                    img.onerror = () => {
                      console.warn('Image failed to load:', img.src);
                      checkImagesLoaded();
                    };
                  }
                });
                
                // Fallback: print after 10 seconds regardless
                setTimeout(() => {
                  if (!printAttempted) {
                    console.log('Fallback print trigger');
                    attemptPrint();
                  }
                }, 10000);
              };
              
              // Handle print dialog events
              window.onbeforeprint = function() {
                console.log('Print dialog opening');
              };
              
              window.onafterprint = function() {
                console.log('Print dialog closed');
                setTimeout(() => {
                  window.close();
                }, 500);
              };
              
              // Auto-close if user cancels or after timeout
              setTimeout(() => {
                if (!window.closed) {
                  console.log('Auto-closing window after timeout');
                  window.close();
                }
              }, 30000); // 30 second timeout
            </script>
          </body>
        </html>
      `;

      // Write content to the hidden window
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      // Auto-close the main loading after a reasonable time
      setTimeout(() => {
        setIsGenerating(false);
      }, 3000);
      
      console.log('Print window created and automated');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
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
        {isGenerating ? 'Generando PDF...' : Strings.sharePDF}
      </Button>

      {/* Hidden content for PDF generation */}
      <div ref={printRef} style={{ 
        display: 'none',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#333',
        backgroundColor: 'white',
        padding: '20px',
        width: '754px' // A4 width minus margins
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '20px' 
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
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

        {/* Tag Information */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px', 
          marginBottom: '16px', 
          paddingBottom: '16px',
          borderBottom: '1px solid #f0f0f0'
        }}>
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

        <div className="info-grid">
          <div className="info-item">
            <span className="label">{Strings.creationDate}: </span>
            <span className="value">{formatDate(card.createdAt) || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.createdBy}: </span>
            <span className="value">{card.creatorName || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.daysSinceCreation}: </span>
            <span className="value">{getDaysSince(card.createdAt) || Strings.cero}</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="label">{Strings.dueDate}: </span>
            <span className="value">{card.cardDueDate || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.priority}: </span>
            <span className="value">
              {card.priorityCode ? `${card.priorityCode} - ${card.priorityDescription}` : Strings.NA}
            </span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.dateStatus}: </span>
            <span 
              className="status-badge"
              style={{
                backgroundColor: cardStatus.dateStatus === Strings.expired ? '#ff4d4f' : '#73d13d'
              }}
            >
              {cardStatus.dateStatus}
            </span>
          </div>
        </div>

        {/* Problem Details */}
        <div className="divider">
          <div className="line"></div>
          <span className="text">{Strings.problemDetails}</span>
          <div className="line"></div>
        </div>

        <div className="info-grid two-cols">
          <div className="info-item">
            <span className="label">{Strings.problemType}: </span>
            <span className="value">
              {card.preclassifierCode ? `${card.preclassifierCode} - ${card.preclassifierDescription}` : Strings.NA}
            </span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.location}: </span>
            <span className="value">{card.cardLocation || Strings.NA}</span>
          </div>
        </div>

        <div className="info-grid two-cols">
          <div className="info-item">
            <span className="label">{Strings.mechanic}: </span>
            <span className="value">{card.mechanicName || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.anomalyDetected}: </span>
            <span className="value">{card.commentsAtCardCreation || Strings.NA}</span>
          </div>
        </div>

        {/* Provisional Solution */}
        <div className="divider">
          <div className="line"></div>
          <span className="text">{Strings.provisionalSolution}</span>
          <div className="line"></div>
        </div>

        <div className="info-grid two-cols">
          <div className="info-item">
            <span className="label">{Strings.tagDate}: </span>
            <span className="value">{formatDate(card.cardProvisionalSolutionDate) || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.tagDays}: </span>
            <span className="value">
              {getDaysBetween(card.createdAt, card.cardProvisionalSolutionDate) || Strings.ceroDays}
            </span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="label">{Strings.appProvisionalUser}: </span>
            <span className="value">{card.userAppProvisionalSolutionName || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.provisionalUser}: </span>
            <span className="value">{card.userProvisionalSolutionName || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.provisionalSoluitonApplied}: </span>
            <span className="value">{card.commentsAtCardProvisionalSolution || Strings.NA}</span>
          </div>
        </div>

        {/* Definitive Solution */}
        <div className="divider">
          <div className="line"></div>
          <span className="text">{Strings.definitiveSolution}</span>
          <div className="line"></div>
        </div>

        <div className="info-grid two-cols">
          <div className="info-item">
            <span className="label">{Strings.tagDate}: </span>
            <span className="value">{formatDate(card.cardDefinitiveSolutionDate) || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.tagDays}: </span>
            <span className="value">
              {getDaysBetween(card.createdAt, card.cardDefinitiveSolutionDate) || Strings.ceroDays}
            </span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="label">{Strings.appDefinitiveUser}: </span>
            <span className="value">{card.userAppDefinitiveSolutionName || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.definitiveUser}: </span>
            <span className="value">{card.userDefinitiveSolutionName || Strings.NA}</span>
          </div>
          <div className="info-item">
            <span className="label">{Strings.definitiveSolutionApplied}: </span>
            <span className="value">{card.commentsAtCardDefinitiveSolution || Strings.NA}</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="timestamp">
          {moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}
        </div>

        {/* Evidence Sections */}
        {showEvidencesAtCreation() && (
          <div className="page-break">
            <div className="divider">
              <div className="line"></div>
              <span className="text">{Strings.evidencesAtCreationDivider}</span>
              <div className="line"></div>
            </div>

            {imagesAtCreation.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.images}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {imagesAtCreation.map((value, index) => (
                    <img
                      key={index}
                      src={value.evidenceName}
                      alt={`Evidence ${index + 1}`}
                      className="evidence-image"
                    />
                  ))}
                </div>
              </div>
            )}

            {videosAtCreation.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.videos}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {videosAtCreation.map((value, index) => (
                    <div key={index} className="evidence-link">
                      VIDEO_{index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audiosAtCreation.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.audios}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {audiosAtCreation.map((value, index) => (
                    <div key={index} className="evidence-link">
                      AUDIO_{index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showEvidencesAtProvisionalSolution() && (
          <div className="page-break">
            <div className="divider">
              <div className="line"></div>
              <span className="text">{Strings.evidencesAtProvisionalDivider}</span>
              <div className="line"></div>
            </div>

            {imagesAtProvisionalSolution.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.images}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {imagesAtProvisionalSolution.map((value, index) => (
                    <img
                      key={index}
                      src={value.evidenceName}
                      alt={`Evidence ${index + 1}`}
                      className="evidence-image"
                    />
                  ))}
                </div>
              </div>
            )}

            {videosAtProvisionalSolution.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.videos}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {videosAtProvisionalSolution.map((value, index) => (
                    <div key={index} className="evidence-link">
                      VIDEO_{index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audiosAtProvisionalSolution.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.audios}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {audiosAtProvisionalSolution.map((value, index) => (
                    <div key={index} className="evidence-link">
                      AUDIO_{index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showEvidencesAtDefinitiveSolution() && (
          <div className="page-break">
            <div className="divider">
              <div className="line"></div>
              <span className="text">{Strings.evidencesAtDefinitiveDivider}</span>
              <div className="line"></div>
            </div>

            {imagesAtDefinitiveSolution.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.images}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {imagesAtDefinitiveSolution.map((value, index) => (
                    <img
                      key={index}
                      src={value.evidenceName}
                      alt={`Evidence ${index + 1}`}
                      className="evidence-image"
                    />
                  ))}
                </div>
              </div>
            )}

            {videosAtDefinitiveSolution.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.videos}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {videosAtDefinitiveSolution.map((value, index) => (
                    <div key={index} className="evidence-link">
                      VIDEO_{index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audiosAtDefinitiveSolution.length > 0 && (
              <div className="no-page-break">
                <div className="divider-small">
                  <div className="line"></div>
                  <span className="text">{Strings.audios}</span>
                  <div className="line"></div>
                </div>
                <div className="evidence-grid">
                  {audiosAtDefinitiveSolution.map((value, index) => (
                    <div key={index} className="evidence-link">
                      AUDIO_{index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TagPrintPDF;
