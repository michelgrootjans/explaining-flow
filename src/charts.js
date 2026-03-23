const { Chart } = require('chart.js');
const PubSub = require("pubsub-js");
const TimeAdjustments = require("./timeAdjustments");
const { percentile } = require("./percentile");

const percentileLinesPlugin = {
    id: 'percentileLines',
    beforeDraw(chart) {
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
                mode: 'x',
                intersect: false,
            },
            percentileLines: [],
            plugins: {
                legend: {display: true, position: 'bottom', align: 'start'},
                title: {
                    display: true,
                    text: 'Cycle Time Scatter Plot'
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
            const lines = [{value: p50, color: 'rgb(128,128,128)', label: 'p50'}];
            if (p85 !== p50) lines.push({value: p85, color: 'rgb(128,128,128)', label: 'p85'});
            state.chart.options.percentileLines = lines;
        });

        PubSub.subscribe('board.done', () => {
            clearInterval(timerId);
            updatechartData()
        });
    });

    return state.chart;
}

module.exports = {LineChart}
