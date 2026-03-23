const PubSub = require('pubsub-js');
const scenarios = require('./scenarios')
const Animation = require('./animation');
const {LimitBoardWip} = require('../src/strategies');
const TimeAdjustments = require('./timeAdjustments');
const Stats = require('./stats');
const WorkerStats = require('./worker-stats');
const Scenario = require("./scenario");
const LineChart = require("./charts");
const Cfd = require("./CumulativeFlowDiagram");
const {parseInput} = require("./parsing");
const { Chart } = require('chart.js');
const crosshairPlugin = require('./crosshair');
Chart.register(crosshairPlugin);

const FormHelper = require("./form-helper");

const snapshots = new Map();

function captureSnapshot(scenarioId) {
    PubSub.subscribe('board.done', () => {
        snapshots.set(scenarioId, {
            boardHtml: document.getElementById('board').innerHTML,
            cfdDatasets: cfd.data.datasets.map(ds => ({
                ...ds,
                data: ds.data.map(point => ({...point}))
            })),
            lineChartDatasets: lineChart.data.datasets.map(ds => ({
                ...ds,
                data: ds.data.map(point => ({...point}))
            })),
            percentileLines: [...(lineChart.options.percentileLines || [])]
        });
        document.getElementById(`scenario-${scenarioId}`).classList.add('done');
    });
}

function restoreSnapshot(scenarioId) {
    const snapshot = snapshots.get(scenarioId);
    if (!snapshot) return;

    document.getElementById('board').innerHTML = snapshot.boardHtml;

    cfd.data.datasets = snapshot.cfdDatasets.map(ds => ({
        ...ds,
        data: ds.data.map(point => ({...point}))
    }));
    cfd.update();

    lineChart.data.datasets[0].data = snapshot.lineChartDatasets[0].data.map(point => ({...point}));
    lineChart.data.datasets[1].data = [];
    lineChart.options.percentileLines = [...(snapshot.percentileLines || [])];
    lineChart.update();

    document.querySelectorAll('.scenario.instance').forEach(el => el.classList.remove('selected'));
    document.getElementById(`scenario-${scenarioId}`).classList.add('selected');
}

function createScenarioContainer(scenario) {
    const template = document.querySelector('#scenario-template');

    const clone = template.content.cloneNode(true).querySelector('ul');
    clone.setAttribute('id', `scenario-${scenario.id}`);
    clone.querySelector('.scenario-title').textContent = scenario.title;
    return clone
}

function parse(form) {
  const field = fieldName => form.querySelector(`[name="${fieldName}"]`).value;

  return parseInput({
      title: field('workload'),
      workers: field('workers'),
      workload: field('workload'),
      wipLimit: field('wip-limit'),
      numberOfStories: field('numberOfStories'),
      random: form.querySelector('[name="random"]').checked
  });
}

function parseScenario(event) {
  return Scenario(parse(event.target));
}

document.addEventListener('DOMContentLoaded', () => {
    const form = FormHelper.initialize();

    document.getElementById('new-scenario')
      .addEventListener('submit', event => {
        event.preventDefault()
        if(!form.isValid()) return;

        const scenario = parseScenario(event);
        const $container = createScenarioContainer(scenario);
        const $scenarios = document.getElementById('scenarios');

        const $lastScenario = document.getElementsByClassName('scenario instance')[0];
        $scenarios.insertBefore($container, $lastScenario);

        $container.addEventListener('click', () => restoreSnapshot(scenario.id));

        document.querySelectorAll('.scenario.instance').forEach(el => el.classList.remove('selected'));
        $container.classList.add('selected');

        run(scenario);
      })
});

const wipLimiter = LimitBoardWip();


let lineChart = undefined;
let cfd = undefined;

function run(scenario) {
    PubSub.clearAllSubscriptions();

    Animation.initialize(`#scenario-${scenario.id}`);
    Stats.initialize();

    new WorkerStats();
    document.title = scenario.title
    TimeAdjustments.speedUpBy(scenario.speed || 1);

    wipLimiter.initialize(scenario.wipLimit)
    if(lineChart) lineChart.destroy()

    lineChart = LineChart(document.getElementById('lineChart'), scenario.speed,  250)

    if(cfd) cfd.destroy()
    cfd = Cfd(document.getElementById('cfd'), 2000, scenario.speed)

    const board = scenario.run();
    captureSnapshot(scenario.id);
}

