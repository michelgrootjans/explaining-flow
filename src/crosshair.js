let currentX = null;
const charts = [];

const crosshairPlugin = {
  id: 'crosshair',
  afterInit(chart) {
    charts.push(chart);

    chart.canvas.addEventListener('mousemove', (e) => {
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

  afterDraw(chart) {
    if (currentX === null) return;
    const xPixel = chart.scales.x.getPixelForValue(currentX);
    const { ctx, scales: { y } } = chart;

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

  beforeDestroy(chart) {
    const index = charts.indexOf(chart);
    if (index > -1) charts.splice(index, 1);
  }
};

module.exports = crosshairPlugin;
