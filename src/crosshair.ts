let currentX: number | null = null;
const charts: any[] = [];

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function getValuesAtX(chart: any, x: number) {
  const isScatter = chart.config.type === 'scatter';
  const entries: any[] = [];

  chart.data.datasets.forEach((dataset: any, i: number) => {
    const meta = chart.getDatasetMeta(i);
    if (meta.hidden) return;

    const points = dataset.data;
    if (!points || points.length === 0) return;

    if (isScatter) {
      const xRange = chart.scales.x.max - chart.scales.x.min;
      const tolerance = Math.max(xRange * 0.015, 0.1);
      points
        .filter((p: any) => Math.abs(p.x - x) <= tolerance)
        .forEach((p: any) => {
          entries.push({ label: dataset.label, value: p.y.toFixed(2), color: dataset.borderColor });
        });
    } else {
      let lastY = null;
      for (const p of points) {
        if (p.x <= x) lastY = p.y;
        else break;
      }
      if (lastY !== null) {
        entries.push({ label: dataset.label, value: lastY, color: dataset.borderColor });
      }
    }
  });

  return entries;
}

function drawTooltip(ctx: CanvasRenderingContext2D, chartArea: any, xPixel: number, entries: any[], dayLabel: string) {
  const padding = 7;
  const lineHeight = 17;
  const fontSize = 11;
  const swatchSize = 9;
  const swatchGap = 5;
  const headerHeight = lineHeight + 2;

  ctx.font = `bold ${fontSize}px sans-serif`;
  const headerWidth = ctx.measureText(dayLabel).width;
  ctx.font = `${fontSize}px sans-serif`;
  const maxLabelWidth = entries.reduce((max, e) => {
    const w = ctx.measureText(`${e.label}: ${e.value}`).width;
    return Math.max(max, w);
  }, 0);

  const contentWidth = Math.max(headerWidth, maxLabelWidth + swatchSize + swatchGap);
  const boxWidth = contentWidth + padding * 2;
  const boxHeight = headerHeight + entries.length * lineHeight + padding * 2;

  let boxX = xPixel + 10;
  if (boxX + boxWidth > chartArea.right) {
    boxX = xPixel - boxWidth - 10;
  }
  const boxY = chartArea.top + 8;

  ctx.save();
  ctx.setLineDash([]);

  drawRoundRect(ctx, boxX, boxY, boxWidth, boxHeight, 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.93)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = '#555';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(dayLabel, boxX + padding, boxY + padding + lineHeight / 2);

  entries.forEach((entry, i) => {
    const textY = boxY + padding + headerHeight + i * lineHeight + lineHeight / 2;
    ctx.fillStyle = entry.color;
    ctx.fillRect(boxX + padding, textY - swatchSize / 2, swatchSize, swatchSize);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = '#333';
    ctx.fillText(`${entry.label}: ${entry.value}`, boxX + padding + swatchSize + swatchGap, textY);
  });

  ctx.restore();
}

const crosshairPlugin = {
  id: 'crosshair',
  afterInit(chart: any) {
    charts.push(chart);

    chart.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = chart.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      currentX = chart.scales.x.getValueForPixel(mouseX);
      charts.forEach(c => c.update('none'));
    });

    chart.canvas.addEventListener('mouseleave', () => {
      currentX = null;
      charts.forEach(c => c.update('none'));
    });
  },

  afterDraw(chart: any) {
    if (currentX === null) return;
    if (chart.options.crosshair === false) return;
    const xPixel = chart.scales.x.getPixelForValue(currentX);
    const { ctx, scales: { y }, chartArea } = chart;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xPixel, y.top);
    ctx.lineTo(xPixel, y.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  },

  beforeDestroy(chart: any) {
    const index = charts.indexOf(chart);
    if (index > -1) charts.splice(index, 1);
  }
};

export default crosshairPlugin;
