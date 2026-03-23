import { Chart } from 'chart.js';
import PubSub from 'pubsub-js';
import * as TimeAdjustments from './timeAdjustments';
import { percentile } from './percentile';

const histogramVerticalLinesPlugin = {
    id: 'histogramVerticalLines',
    beforeDraw(chart: any) {
        const lines = chart.options.verticalLines;
        if (!lines || lines.length === 0) return;
        const {ctx, chartArea: {top, bottom, left, right}, scales: {x}} = chart;
        // Category scale: interpolate pixel using uniform bar spacing
        const offset = chart.options.verticalLinesOffset || 0;
        const origin = x.getPixelForValue(0);
        const step = x.getPixelForValue(1) - origin;
        ctx.save();
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        for (const {value, color, label} of lines) {
            const px = origin + (value - offset) * step;
            if (px < left || px > right) continue;
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.moveTo(px, top);
            ctx.lineTo(px, bottom);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = color;
            ctx.fillText(label, px, top - 2);
        }
        ctx.restore();
    }
};

function HistogramChart($chart: HTMLCanvasElement) {
    const ctx = $chart.getContext('2d')!;

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {labels: [], datasets: [{data: [], backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgb(75, 192, 192)', borderWidth: 1}]},
        options: {
            animation: false as const,
            crosshair: false,
            verticalLines: [],
            plugins: {
                legend: {display: false},
                title: {display: true, text: 'Cycle Time Histogram'},
                histogramVerticalLines: {}
            },
            scales: {
                x: {title: {display: true, text: 'Cycle Time (days)'}},
                y: {beginAtZero: true, ticks: {stepSize: 1}, title: {display: true, text: 'Count'}}
            }
        } as any,
        plugins: [histogramVerticalLinesPlugin]
    });

    function rebuild(cycleTimes: number[]) {
        if (cycleTimes.length === 0) return;
        const MAX_BINS = 20;
        const minDay = Math.round(Math.min(...cycleTimes));
        const maxDay = Math.round(Math.max(...cycleTimes));
        const range = maxDay - minDay + 1;
        const binSize = Math.ceil(range / MAX_BINS);
        const numBins = Math.ceil(range / binSize);

        const counts = Array(numBins).fill(0);
        cycleTimes.forEach(v => {
            const bin = Math.min(Math.floor((Math.round(v) - minDay) / binSize), numBins - 1);
            counts[bin]++;
        });

        (chart.data as any).labels = counts.map((_: any, i: number) => {
            const start = minDay + i * binSize;
            const end = start + binSize - 1;
            return binSize === 1 ? `${start}` : `${start}-${end}`;
        });
        chart.data.datasets[0]!.data = counts as any;

        const p50 = percentile(cycleTimes, 0.5);
        const p85 = percentile(cycleTimes, 0.85);
        if (p50 === null || p85 === null) return;
        const toBinIndex = (v: number) => (v - minDay) / binSize;
        (chart.options as any).verticalLinesOffset = 0;
        const lines = [{value: toBinIndex(p50), color: 'rgb(128,128,128)', label: 'p50'}];
        if (p85 !== p50) lines.push({value: toBinIndex(p85), color: 'rgb(128,128,128)', label: 'p85'});
        (chart.options as any).verticalLines = lines;
        chart.update();
    }

    const cycleTimes: number[] = [];

    PubSub.subscribe('workitem.finished', (event: string, item: any) => {
        cycleTimes.push(item.duration / (TimeAdjustments.multiplicator() * 1000));
        rebuild(cycleTimes);
    });

    return chart;
}

export { HistogramChart };
