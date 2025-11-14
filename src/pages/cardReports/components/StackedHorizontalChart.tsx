import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import Strings from '../../../utils/localizations/Strings';

interface StackedDataRow {
  l3_id: number;
  l3_name: string;
  l4_id: number;
  l4_name: string;
  l6_id: number;
  l6_name: string;
  total_cards: number;
}

interface StackedHorizontalChartProps {
  data: StackedDataRow[];
  levelNames: {
    g1: string;
    g2: string;
    target: string;
  };
}

// Normalize side names (Izquierdo/Derecho)
const normalizeSide = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('izq')) return 'Izquierdo';
  if (lower.includes('der')) return 'Derecho';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Plugin to render group titles (G1 level headers) - Only for stacked charts
const createGroupTitlePlugin = (groupRows: Set<string>) => ({
  id: 'groupTitles',
  afterDatasetsDraw(chart: any) {
    // Only run if this chart has the y scale (horizontal bar)
    if (!chart.scales?.y || chart.options?.indexAxis !== 'y') return;

    const { ctx, scales: { y } } = chart;

    ctx.save();
    ctx.font = '600 12px system-ui, Arial';
    ctx.fillStyle = '#495057';
    ctx.textBaseline = 'middle';

    chart.data.labels.forEach((lab: string, i: number) => {
      if (groupRows.has(lab)) {
        const yPos = y.getPixelForValue(i);
        ctx.fillText(lab, y.left + 6, yPos);
      }
    });

    ctx.restore();
  }
});

// Plugin to render row totals - Only for stacked charts
const createRowTotalsPlugin = () => ({
  id: 'rowTotals',
  afterDatasetsDraw(chart: any) {
    // Only run if this chart has both x and y scales (horizontal bar)
    if (!chart.scales?.x || !chart.scales?.y || chart.options?.indexAxis !== 'y') return;

    const { ctx, data, chartArea, scales: { x, y } } = chart;

    ctx.save();
    ctx.font = '600 11px system-ui, Arial';
    ctx.fillStyle = '#495057';
    ctx.textBaseline = 'middle';

    data.labels.forEach((lab: string, i: number) => {
      if (!lab || !lab.includes(' – ')) return;

      let total = 0;
      data.datasets.forEach((ds: any) => {
        total += (+ds.data[i] || 0);
      });

      const yPos = y.getPixelForValue(i);
      const xPos = x.getPixelForValue(total);
      const offset = 10;

      ctx.fillText(
        total.toLocaleString(),
        Math.min(xPos + offset, chartArea.right - 2),
        yPos
      );
    });

    ctx.restore();
  }
});

const StackedHorizontalChart: React.FC<StackedHorizontalChartProps> = ({ data, levelNames }) => {
  const { labels, datasets, groupRows } = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [] as string[], datasets: [], groupRows: new Set<string>() };
    }

    // Group data by G1 (l3) and G2 (l4)
    const byL3L4: Record<string, Record<string, Record<string, number>>> = {};
    const l6set = new Set<string>();
    const idIndex: Record<string, Record<string, { l3_id: number; l4_id: number }>> = {};

    data.forEach((r) => {
      const l3 = r.l3_name;
      const side = normalizeSide(r.l4_name);
      const l6 = r.l6_name;
      const v = r.total_cards;

      if (!byL3L4[l3]) byL3L4[l3] = { Izquierdo: {}, Derecho: {} };
      if (!byL3L4[l3][side]) byL3L4[l3][side] = {};

      byL3L4[l3][side][l6] = (byL3L4[l3][side][l6] || 0) + v;

      if (!idIndex[l3]) idIndex[l3] = {};
      if (!idIndex[l3][side]) {
        idIndex[l3][side] = { l3_id: r.l3_id, l4_id: r.l4_id };
      }

      l6set.add(l6);
    });

    // Ensure both sides exist
    Object.keys(byL3L4).forEach((l3) => {
      if (!byL3L4[l3].Izquierdo) byL3L4[l3].Izquierdo = {};
      if (!byL3L4[l3].Derecho) byL3L4[l3].Derecho = {};
    });

    // Order target names (customize this order as needed)
    const ORDER_L6 = ['Fileta', 'Husos', 'Mesa de anillo', 'Tren estiraje', 'Sin L6'];
    const extras = Array.from(l6set).filter((l6) => !ORDER_L6.includes(l6));
    const l6names = [...ORDER_L6.filter((l6) => l6set.has(l6)), ...extras];

    // Sort groups by total (descending)
    const groups = Object.keys(byL3L4).map((l3) => {
      const izqTotal = Object.values(byL3L4[l3].Izquierdo).reduce((sum, v) => sum + v, 0);
      const derTotal = Object.values(byL3L4[l3].Derecho).reduce((sum, v) => sum + v, 0);

      return {
        name: l3,
        tot: izqTotal + derTotal,
        sides: {
          Izquierdo: { total: izqTotal, vals: byL3L4[l3].Izquierdo },
          Derecho: { total: derTotal, vals: byL3L4[l3].Derecho },
        },
      };
    });

    groups.sort((a, b) => b.tot - a.tot);

    // Build labels and row metadata
    const finalLabels: string[] = [];
    const rowMeta: Record<string, Record<string, number>> = {};
    const groupRowsSet = new Set<string>();

    groups.forEach((m) => {
      finalLabels.push(m.name); // Group header
      groupRowsSet.add(m.name);

      const sidePairs = [
        { name: 'Izquierdo', pack: m.sides.Izquierdo },
        { name: 'Derecho', pack: m.sides.Derecho },
      ];

      // Sort sides by total (descending)
      sidePairs.sort((a, b) => b.pack.total - a.pack.total);

      sidePairs.forEach(({ name: sideName, pack }) => {
        const lab = `${m.name} – ${sideName}`;
        finalLabels.push(lab);
        rowMeta[lab] = pack.vals;
      });

      finalLabels.push(''); // Separator
    });

    // Remove trailing separator
    if (finalLabels[finalLabels.length - 1] === '') {
      finalLabels.pop();
    }

    // Build datasets for each target (l6)
    const palette: Record<string, string> = {
      Fileta: '#0d6efd',
      Husos: '#198754',
      'Mesa de anillo': '#ffc107',
      'Tren estiraje': '#dc3545',
      'Sin L6': '#6c757d',
    };

    const finalDatasets = l6names.map((l6) => {
      const rowValues = finalLabels.map((lab) => {
        if (!rowMeta[lab]) return null; // Headers/separators
        return rowMeta[lab][l6] || null;
      });

      // Pre-calculate colors to avoid function calls on every render
      const bgColor = palette[l6] || '#0dcaf0';
      const bgColors = rowValues.map(v => v && v > 0 ? bgColor : 'rgba(0,0,0,0)');
      const borderColors = rowValues.map(v => v && v > 0 ? '#ffffff' : 'rgba(0,0,0,0)');
      const borderWidths = rowValues.map(v => v && v > 0 ? 1 : 0);

      return {
        label: l6,
        data: rowValues,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: borderWidths,
        barThickness: 18,
        categoryPercentage: 0.78,
      };
    });

    return { labels: finalLabels, datasets: finalDatasets, groupRows: groupRowsSet };
  }, [data]);

  // Memoize plugins only when groupRows changes
  const plugins = useMemo(() => [
    createGroupTitlePlugin(groupRows),
    createRowTotalsPlugin()
  ], [groupRows]);

  const options: ChartOptions<'bar'> = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { right: 80 },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: `${Strings.totalCards} (${levelNames.target})`,
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: `${levelNames.g1} → ${levelNames.g2}`,
        },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          callback: (_, idx) => {
            const lab = labels[idx];
            return !lab || !lab.includes(' – ') ? '' : lab;
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: `${levelNames.target} ${Strings.stackedBy} ${levelNames.g2} ${Strings.withinEach} ${levelNames.g1} ${Strings.sortedDesc}`,
      },
      tooltip: {
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (ctx) => `${ctx.dataset.label}: ${(ctx.raw || 0).toLocaleString()}`,
        },
      },
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: '#fff',
        font: { weight: 'bold', size: 10 },
        formatter: (value, ctx) => {
          const lab = labels[ctx.dataIndex];
          if (!lab || !lab.includes(' – ')) return '';
          return value ? `${ctx.dataset.label}: ${value}` : '';
        },
        clip: true,
      },
    },
  }), [labels, levelNames]);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6c757d' }}>
        {Strings.noData}
      </div>
    );
  }

  return (
    <div style={{ height: 900, position: 'relative' }}>
      <Bar data={{ labels, datasets }} options={options} plugins={plugins} />
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(StackedHorizontalChart);
