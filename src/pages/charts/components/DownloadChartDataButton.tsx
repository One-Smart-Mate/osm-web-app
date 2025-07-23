import { useState } from "react";
import { Button, notification } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';
import { 
  useGetCardsMutation
} from "../../../services/cardService";
import { handleErrorNotification } from "../../../utils/Notifications";
import { CardInterface } from "../../../data/card/card";

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
      'Número de Tarjeta': card.siteCardId || 'N/A',
      'Tipo de Tarjeta': card.cardTypeName || 'N/A', 
      'Estado': card.status === 'A' ? 'Abierta' : 'Cerrada',
      'Mecánico Asignado': card.mechanicName || 'Sin asignar',
      'Responsable': card.responsableName || 'Sin asignar',
      'Área': card.areaName || 'N/A',
      'Ubicación': card.cardLocation || 'N/A',
      'Preclasificador': card.preclassifierDescription || 'N/A',
      'Descripción': card.commentsAtCardCreation || 'N/A',
      'Fecha Creación': card.createdAt ? new Date(card.createdAt).toLocaleDateString('es-ES') : 'N/A',
      'Fecha Cierre': card.cardDefinitiveSolutionDate ? new Date(card.cardDefinitiveSolutionDate).toLocaleDateString('es-ES') : 'Pendiente',
      'Prioridad': card.priorityDescription || 'N/A',
      'Creador': card.creatorName || 'N/A',
      'Solución': card.commentsAtCardDefinitiveSolution || 'Pendiente',
      'Días Abierta': card.createdAt ? 
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
        message: "Generando Reporte Completo",
        description: "Recopilando y organizando todos los datos...",
        duration: 2,
      });

      // Get cards data
      const cardsResult = await getCards(siteId).unwrap();
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
         'Número de Tarjeta': card.siteCardId || 'N/A',
         'Tipo de Tarjeta': card.cardTypeName || 'N/A',
         'Estado': card.status === 'A' ? 'Abierta' : 'Cerrada',
         'Mecánico Asignado': card.mechanicName || 'Sin asignar'
       }));
       let quickSummarySheet = XLSX.utils.json_to_sheet(quickSummaryData);
       quickSummarySheet = applyBasicStyling(quickSummarySheet, quickSummaryData);
       XLSX.utils.book_append_sheet(workbook, quickSummarySheet, "⚡ Resumen Rápido");

       // Sheet 2: Complete Card Details (Main sheet with all the info the user requested)
       const cardDetailsData = formatCardDataForExport(filteredCards);
       let cardDetailsSheet = XLSX.utils.json_to_sheet(cardDetailsData);
       cardDetailsSheet = applyBasicStyling(cardDetailsSheet, cardDetailsData);
       XLSX.utils.book_append_sheet(workbook, cardDetailsSheet, "📋 Detalles Completos");

             // Sheet 3: Summary by Card Type
       const cardTypeSummary: any[] = [];
       const cardTypeGroups = filteredCards.reduce((acc: any, card) => {
         const type = card.cardTypeName || 'Sin Tipo';
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
           'Tipo de Tarjeta': type,
           'Total': stats.total,
           'Abiertas': stats.open,
           'Cerradas': stats.closed,
           '% Completadas': `${((stats.closed / stats.total) * 100).toFixed(1)}%`,
           'Con Mecánico': stats.withMechanic,
           '% Asignadas': `${((stats.withMechanic / stats.total) * 100).toFixed(1)}%`
         });
       });
       let summarySheet = XLSX.utils.json_to_sheet(cardTypeSummary);
       summarySheet = applyBasicStyling(summarySheet, cardTypeSummary);
       XLSX.utils.book_append_sheet(workbook, summarySheet, "📊 Resumen por Tipo");

       // Sheet 4: Mechanics Performance
       const mechanicsSummary: any[] = [];
       const mechanicsGroups = filteredCards.reduce((acc: any, card) => {
         const mechanic = card.mechanicName || 'Sin Asignar';
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
           'Mecánico': mechanic,
           'Total': stats.total,
           'Abiertas': stats.open,
           'Cerradas': stats.closed,
           '% Completadas': `${((stats.closed / stats.total) * 100).toFixed(1)}%`,
           'Tipos': Array.from(stats.types).join(', ')
         });
       });
       let mechanicsSheet = XLSX.utils.json_to_sheet(mechanicsSummary);
       mechanicsSheet = applyBasicStyling(mechanicsSheet, mechanicsSummary);
       XLSX.utils.book_append_sheet(workbook, mechanicsSheet, "👷 Análisis Mecánicos");

       // Sheet 5: Areas Performance
      const areasSummary: any[] = [];
      const areasGroups = filteredCards.reduce((acc: any, card) => {
        const area = card.areaName || 'Sin Área';
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
          'Área': area,
          'Total': stats.total,
          'Abiertas': stats.open,
          'Cerradas': stats.closed,
          '% Completadas': `${((stats.closed / stats.total) * 100).toFixed(1)}%`,
          'Tipos': Array.from(stats.types).join(', ')
        });
      });
      let areasSheet = XLSX.utils.json_to_sheet(areasSummary);
      areasSheet = applyBasicStyling(areasSheet, areasSummary);
      XLSX.utils.book_append_sheet(workbook, areasSheet, "🏭 Análisis Áreas");

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
        message: "¡Reporte Descargado!",
        description: `Excel completo con ${Object.keys(workbook.Sheets).length} hojas generado exitosamente`,
        duration: 4,
      });

    } catch (error) {
      console.error("Download error:", error);
      handleErrorNotification("Error al generar el reporte");
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
      {loading ? "Generando Excel..." : "Descargar Datos Completos"}
    </Button>
  );
};

export default DownloadChartDataButton;
