import { Chart } from 'chart.js';
import PubSub from 'pubsub-js';
import * as TimeAdjustments from './timeAdjustments';
import { percentile } from './percentile';

const percentileLinesPlugin = {
    id: 'percentileLines',
    beforeDraw(chart: any) {
        const lines = chart.options.percentileLines;
        if (!lines || lines.length === 0) return;
        const {ctx, chartArea, scales} = chart;
        const {top, bottom, left, right} = chartArea;
        const yScale = scales.y;
        ctx.save();

        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        for (const {value, color, label} of lines) {
            const y = yScale.getPixelForValue(value);
            if (y < top || y > bottom) continue;
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.fillText(label, right + 4, y);
        }
        ctx.restore();
    }
};

Chart.register(percentileLinesPlugin);

function createChart(ctx: any, _speed: number) {
    const leadTime: any[] = [];
    const throughput: any[] = [];
    const wip: any[] = [];
    const labels: any[] = [];
    const startTime = new Date();
    const cycleTime: any[] = []
    const itemAge: any[] = []

    const data = {
        labels,
        datasets: [
            {
                label: 'Cycle time',
                data: cycleTime,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: false,
            },
            {
                label: 'Item Age',
                data: itemAge,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 1,
                fill: false,
            },
        ]
    };

    const config = {
        type: 'scatter' as const,
        data: data,
        options: {
            animation: false as const,
            layout: {
                padding: {right: 36}
            },
            scales: {
                x: {
                    beginAtZero: true,
                    suggestedMax: 20,
                    title: {
                        display: true,
                        text: 'Project days'
                    }
                },
                y: {
                    suggestedMax: 2,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Cycle Time (days)'
                    }
                },
            },
            interaction: {
                mode: 'x' as const,
                intersect: false,
            },
            percentileLines: [] as any[],
            plugins: {
                legend: {display: true, position: 'bottom', align: 'start' as const},
                title: {
                    display: true,
                    text: 'Cycle Time Scatter Plot'
                }
            }
        }
    };
    const chart = new Chart(ctx, config as any);
    return {leadTime, throughput, wip, data, chart, labels, startTime, cycleTime, itemAge};
}

function currentDate(startTime: Date, endDate: Date | number, speed: number) {
    return (new Date(endDate).getTime() - startTime.getTime()) * speed / 1000;
}

function LineChart($chart: HTMLCanvasElement, speed: number, updateInterval: number) {
    const ctx = $chart.getContext('2d');

    let state = createChart(ctx, speed);

    PubSub.subscribe('board.ready', () => {
        const updatechartData = () => {
            state.itemAge.length = 0;
            state.itemAge.push(...workItems
                .filter((item: any) => !item.duration)
                .map((item: any) => ({x: currentDate(state.startTime, new Date(), speed), y: ((Date.now() - item.startTime) / (TimeAdjustments.multiplicator() * 1000))}))
            )
            state.chart.update()
            console.log({cycletime: state.cycleTime, age: state.itemAge})
        }

        let workItems: any[] = []
        const timerId = setInterval(updatechartData, updateInterval)

        PubSub.subscribe('workitem.started', (event: string, item: any) => {
            workItems.push(item)
        });

        PubSub.subscribe('workitem.finished', (event: string, item: any) => {
            workItems = workItems.filter((i: any) => i.id !== item.id)
            state.cycleTime.push({x: currentDate(state.startTime, item.endTime, speed), y: (item.duration / (TimeAdjustments.multiplicator() * 1000))})
            const yValues = state.cycleTime.map((pt: any) => pt.y);
            const p50 = percentile(yValues, 0.5);
            const p85 = percentile(yValues, 0.85);
            const lines = [{value: p50, color: 'rgb(128,128,128)', label: 'p50'}];
            if (p85 !== p50) lines.push({value: p85, color: 'rgb(128,128,128)', label: 'p85'});
            (state.chart.options as any).percentileLines = lines;
        });

        PubSub.subscribe('board.done', () => {
            clearInterval(timerId);
            updatechartData()
        });
    });

    return state.chart;
}

export { LineChart };
