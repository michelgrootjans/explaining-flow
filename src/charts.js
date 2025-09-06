const Chart = require('chart.js');
const PubSub = require("pubsub-js");
const TimeAdjustments = require("./timeAdjustments");

function createChart(ctx, speed) {
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
                },
                y: {
                    suggestedMax: 2,
                    beginAtZero: true,
                },
            },
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
        });

        PubSub.subscribe('board.done', () => {
            clearInterval(timerId);
            updatechartData()
        });
    });

    return state.chart;
}

module.exports = LineChart
