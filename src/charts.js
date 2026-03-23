const Chart = require('chart.js');
const PubSub = require("pubsub-js");
const TimeAdjustments = require("./timeAdjustments");

function percentile(values, p) {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.ceil(p * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}

const percentileLinesPlugin = {
    id: 'percentileLines',
    afterDraw(chart) {
        const lines = chart.options.percentileLines;
        if (!lines || lines.length === 0) return;
        const {ctx, chartArea, scales} = chart;
        const {top, bottom, left, right} = chartArea;
        const yScale = scales.y;
        ctx.save();
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
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
            ctx.fillText(label, right - 2, y - 2);
        }
        ctx.restore();
    }
};

Chart.register(percentileLinesPlugin);

function createChart(ctx, _speed) {
    const leadTime = [];
    const throughput = [];
    const wip = [];
    const labels = [];
    const startTime = new Date();
    const cycleTime = []
    const itemAge = []

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
        type: 'scatter',
        data: data,
        options: {
            animation: false,
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
                mode: 'x',
                intersect: false,
            },
            percentileLines: [],
            plugins: {
                legend: {display: true, position: 'bottom', align: 'start'},
                title: {
                    display: true,
                    text: 'Cycle Times'
                }
            }
        }
    };
    const chart = new Chart(ctx, config);
    return {leadTime, throughput, wip, data, chart, labels, startTime, cycleTime, itemAge};
}

function currentDate(startTime, endDate, speed) {
    return (endDate - startTime) * speed / 1000;
}

function LineChart($chart, speed, updateInterval) {
    const ctx = $chart.getContext('2d');

    let state = createChart(ctx, speed);

    PubSub.subscribe('board.ready', () => {
        const updatechartData = () => {
            state.itemAge.length = 0;
            state.itemAge.push(...workItems
                .filter(item => !item.duration)
                .map(item => ({x: currentDate(state.startTime, new Date(), speed), y: ((Date.now() - item.startTime) / (TimeAdjustments.multiplicator() * 1000))}))
            )
            state.chart.update()
            console.log({cycletime: state.cycleTime, age: state.itemAge})
        }

        let workItems = []
        const timerId = setInterval(updatechartData, updateInterval)

        PubSub.subscribe('workitem.started', (event, item) => {
            workItems.push(item)
        });

        PubSub.subscribe('workitem.finished', (event, item) => {
            workItems = workItems.filter(i => i.id !== item.id)
            state.cycleTime.push({x: currentDate(state.startTime, item.endTime, speed), y: (item.duration / (TimeAdjustments.multiplicator() * 1000))})
            const yValues = state.cycleTime.map(pt => pt.y);
            const p50 = percentile(yValues, 0.5);
            const p85 = percentile(yValues, 0.85);
            state.chart.options.percentileLines = [
                {value: p50, color: 'rgba(75, 192, 192, 0.9)', label: 'p50'},
                {value: p85, color: 'rgba(255, 159, 64, 0.9)', label: 'p85'},
            ];
        });

        PubSub.subscribe('board.done', () => {
            clearInterval(timerId);
            updatechartData()
        });
    });

    return state.chart;
}

module.exports = LineChart
