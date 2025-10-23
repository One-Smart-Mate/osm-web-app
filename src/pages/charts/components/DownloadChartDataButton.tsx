import { useState } from "react";
import { Button, notification } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';
import { 
  useGetCardsMutation
} from "../../../services/cardService";
import { handleErrorNotification } from "../../../utils/Notifications";
import { CardInterface } from "../../../data/card/card";
import Strings from "../../../utils/localizations/Strings";

interface DownloadChartDataButtonProps {
  siteId: string;
  startDate?: string;
  endDate?: string;
  cardTypeName?: string | null;
}

const DownloadChartDataButton = ({ 
  siteId, 
  startDate = "", 
  endDate = "", 
  cardTypeName 
}: DownloadChartDataButtonProps) => {
  const [getCards] = useGetCardsMutation();
  const [loading, setLoading] = useState(false);

  // Format card data for detailed export
  const formatCardDataForExport = (cards: CardInterface[]) => {
    return cards.map(card => ({
      [Strings.exportCardNumber]: card.siteCardId || 'N/A',
      [Strings.exportCardType]: card.cardTypeName || 'N/A',
      [Strings.status]: card.status === 'A' ? Strings.open : Strings.closed,
      [Strings.mechanic]: card.mechanicName || Strings.noMechanic,
      [Strings.responsible]: card.responsableName || Strings.noResponsible,
      [Strings.area]: card.areaName || Strings.noArea,
      [Strings.location]: card.cardLocation || 'N/A',
      [Strings.exportPreclassifier]: card.preclassifierDescription || 'N/A',
      [Strings.description]: card.commentsAtCardCreation || 'N/A',
      [Strings.exportCreationDate]: card.createdAt ? new Date(card.createdAt).toLocaleDateString('es-ES') : 'N/A',
      [Strings.closureDate]: card.cardDefinitiveSolutionDate ? new Date(card.cardDefinitiveSolutionDate).toLocaleDateString('es-ES') : Strings.pending,
      [Strings.priority]: card.priorityDescription || 'N/A',
      [Strings.creator]: card.creatorName || 'N/A',
      [Strings.solution]: card.commentsAtCardDefinitiveSolution || Strings.pending,
      [Strings.daysOpen]: card.createdAt ? 
        Math.floor((new Date().getTime() - new Date(card.createdAt).getTime()) / (1000 * 3600 * 24)) : 0
    }));
  };

  // Apply basic styling to worksheet
  const applyBasicStyling = (worksheet: XLSX.WorkSheet, data: any[]): XLSX.WorkSheet => {
    if (!data.length) return worksheet;

    // Auto-width for columns
    const colWidths = [];
    const headers = Object.keys(data[0]);
    
    for (let C = 0; C < headers.length; C++) {
      let maxWidth = headers[C].length;
      for (let R = 0; R < data.length; R++) {
        const value = data[R][headers[C]];
        if (value) {
          const cellLength = value.toString().length;
          maxWidth = Math.max(maxWidth, cellLength);
        }
      }
      colWidths.push({ width: Math.min(maxWidth + 2, 50) });
    }
    
    worksheet['!cols'] = colWidths;

    // Basic header styling (this is limited but works)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      
      // Basic cell formatting (limited support in xlsx)
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center" }
      };
    }

    return worksheet;
  };

  // Download comprehensive analysis Excel
  const handleDownload = async () => {
    setLoading(true);
    try {
      notification.info({
        message: Strings.generatingCompleteReport,
        description: Strings.compilingAndOrganizingData,
        duration: 2,
      });

      // Get cards data
      const cardsResult = await getCards({ siteId }).unwrap();
      const cards: CardInterface[] = Array.isArray(cardsResult) ? cardsResult : (cardsResult as any)?.content || [];

      // Filter cards by date and type if specified
      let filteredCards = cards;
      if (startDate && endDate) {
        filteredCards = cards.filter(card => {
          const cardDate = new Date(card.createdAt);
          return cardDate >= new Date(startDate) && cardDate <= new Date(endDate);
        });
      }
      if (cardTypeName) {
        filteredCards = filteredCards.filter(card => 
          card.cardTypeName === cardTypeName
        );
      }

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();

             // Sheet 1: Quick Summary (Only the 4 main fields requested)
       const quickSummaryData = filteredCards.map(card => ({
         [Strings.exportCardNumber]: card.siteCardId || 'N/A',
         [Strings.exportCardType]: card.cardTypeName || 'N/A',
         [Strings.status]: card.status === 'A' ? Strings.open : Strings.closed,
         [Strings.mechanic]: card.mechanicName || Strings.noMechanic
       }));
       let quickSummarySheet = XLSX.utils.json_to_sheet(quickSummaryData);
       quickSummarySheet = applyBasicStyling(quickSummarySheet, quickSummaryData);
       XLSX.utils.book_append_sheet(workbook, quickSummarySheet, Strings.quickSummary);

       // Sheet 2: Complete Card Details (Main sheet with all the info the user requested)
       const cardDetailsData = formatCardDataForExport(filteredCards);
       let cardDetailsSheet = XLSX.utils.json_to_sheet(cardDetailsData);
       cardDetailsSheet = applyBasicStyling(cardDetailsSheet, cardDetailsData);
       XLSX.utils.book_append_sheet(workbook, cardDetailsSheet, Strings.completeDetails);

             // Sheet 3: Summary by Card Type
       const cardTypeSummary: any[] = [];
       const cardTypeGroups = filteredCards.reduce((acc: any, card) => {
         const type = card.cardTypeName || Strings.noType;
         if (!acc[type]) {
           acc[type] = { total: 0, open: 0, closed: 0, withMechanic: 0 };
         }
         acc[type].total++;
         if (card.status === 'A') acc[type].open++;
         else acc[type].closed++;
         if (card.mechanicName) acc[type].withMechanic++;
         return acc;
       }, {});

               Object.entries(cardTypeGroups).forEach(([type, stats]: [string, any]) => {
          cardTypeSummary.push({
            [Strings.exportCardType]: type,
            [Strings.total]: stats.total,
            [Strings.open]: stats.open,
            [Strings.closed]: stats.closed,
            [Strings.percentCompleted]: `${((stats.closed / stats.total) * 100).toFixed(1)}%`,
            [Strings.withMechanic]: stats.withMechanic,
            [Strings.percentAssigned]: `${((stats.withMechanic / stats.total) * 100).toFixed(1)}%`
          });
        });
       let summarySheet = XLSX.utils.json_to_sheet(cardTypeSummary);
       summarySheet = applyBasicStyling(summarySheet, cardTypeSummary);
       XLSX.utils.book_append_sheet(workbook, summarySheet, Strings.summaryByType);

       // Sheet 4: Mechanics Performance
       const mechanicsSummary: any[] = [];
       const mechanicsGroups = filteredCards.reduce((acc: any, card) => {
         const mechanic = card.mechanicName || Strings.noAssigned;
         if (!acc[mechanic]) {
           acc[mechanic] = { total: 0, open: 0, closed: 0, types: new Set() };
         }
         acc[mechanic].total++;
         if (card.status === 'A') acc[mechanic].open++;
         else acc[mechanic].closed++;
         if (card.cardTypeName) acc[mechanic].types.add(card.cardTypeName);
         return acc;
       }, {});

       Object.entries(mechanicsGroups).forEach(([mechanic, stats]: [string, any]) => {
         mechanicsSummary.push({
           [Strings.mechanic]: mechanic,
           [Strings.total]: stats.total,
           [Strings.open]: stats.open,
           [Strings.closed]: stats.closed,
           [Strings.percentCompleted]: `${((stats.closed / stats.total) * 100).toFixed(1)}%`,
           [Strings.types]: Array.from(stats.types).join(', ')
         });
       });
       let mechanicsSheet = XLSX.utils.json_to_sheet(mechanicsSummary);
       mechanicsSheet = applyBasicStyling(mechanicsSheet, mechanicsSummary);
       XLSX.utils.book_append_sheet(workbook, mechanicsSheet, Strings.mechanicsAnalysis);

       // Sheet 5: Areas Performance
      const areasSummary: any[] = [];
      const areasGroups = filteredCards.reduce((acc: any, card) => {
        const area = card.areaName || Strings.noArea;
        if (!acc[area]) {
          acc[area] = { total: 0, open: 0, closed: 0, types: new Set() };
        }
        acc[area].total++;
        if (card.status === 'A') acc[area].open++;
        else acc[area].closed++;
        if (card.cardTypeName) acc[area].types.add(card.cardTypeName);
        return acc;
      }, {});

      Object.entries(areasGroups).forEach(([area, stats]: [string, any]) => {
                                   areasSummary.push({
                         [Strings.area]: area,
             [Strings.total]: stats.total,
             [Strings.open]: stats.open,
             [Strings.closed]: stats.closed,
             [Strings.percentCompleted]: `${((stats.closed / stats.total) * 100).toFixed(1)}%`,
             [Strings.types]: Array.from(stats.types).join(', ')
          });
      });
      let areasSheet = XLSX.utils.json_to_sheet(areasSummary);
      areasSheet = applyBasicStyling(areasSheet, areasSummary);
      XLSX.utils.book_append_sheet(workbook, areasSheet, Strings.areasAnalysis);

      // Generate and download file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array'
      });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      let fileName = "reporte_completo_graficas";
      if (startDate && endDate) {
        fileName += `_${startDate}_a_${endDate}`;
      }
      if (cardTypeName) {
        fileName += `_${cardTypeName.replace(/\s+/g, '_')}`;
      }
      fileName += ".xlsx";
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notification.success({
        message: Strings.reportDownloaded,
        description: Strings.completeExcelWithSheets.replace('{count}', Object.keys(workbook.Sheets).length.toString()),
        duration: 4,
      });

    } catch (error) {
      console.error("Download error:", error);
      handleErrorNotification(Strings.errorGeneratingReport);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      type="primary" 
      icon={<DownloadOutlined />}
      loading={loading}
      onClick={handleDownload}
      size="large"
         >
               {loading ? Strings.loading : Strings.downloadData}
     </Button>
  );
};

export default DownloadChartDataButton;
