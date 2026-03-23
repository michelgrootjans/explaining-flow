const PubSub = require('pubsub-js');
const scenarios = require('./scenarios')
const Animation = require('./animation');
const {LimitBoardWip} = require('../src/strategies');
const TimeAdjustments = require('./timeAdjustments');
const Stats = require('./stats');
const WorkerStats = require('./worker-stats');
const Scenario = require("./scenario");
const {LineChart} = require("./charts");
const {HistogramChart} = require("./HistogramChart");
const Cfd = require("./CumulativeFlowDiagram");
const {parseInput} = require("./parsing");
const { Chart } = require('chart.js');
const crosshairPlugin = require('./crosshair');
Chart.register(crosshairPlugin);

const FormHelper = require("./form-helper");

const snapshots = new Map();

function captureSnapshot(scenarioId: number) {
    PubSub.subscribe('board.done', () => {
        snapshots.set(scenarioId, {
            boardHtml: document.getElementById('board')!.innerHTML,
            cfdDatasets: cfd.data.datasets.map((ds: any) => ({
                ...ds,
                data: ds.data.map((point: any) => ({...point}))
            })),
            lineChartDatasets: lineChart.data.datasets.map((ds: any) => ({
                ...ds,
                data: ds.data.map((point: any) => ({...point}))
            })),
            percentileLines: [...(lineChart.options.percentileLines || [])],
            histogramLabels: [...histogram.data.labels],
            histogramData: [...histogram.data.datasets[0].data],
            histogramVerticalLines: [...(histogram.options.verticalLines || [])],
            histogramVerticalLinesOffset: histogram.options.verticalLinesOffset || 0
        });
        document.getElementById(`scenario-${scenarioId}`)!.classList.add('done');
    });
}

function restoreSnapshot(scenarioId: number) {
    const snapshot = snapshots.get(scenarioId);
    if (!snapshot) return;

    document.getElementById('board')!.innerHTML = snapshot.boardHtml;

    cfd.data.datasets = snapshot.cfdDatasets.map((ds: any) => ({
        ...ds,
        data: ds.data.map((point: any) => ({...point}))
    }));
    cfd.update();

    lineChart.data.datasets[0].data = snapshot.lineChartDatasets[0].data.map((point: any) => ({...point}));
    lineChart.data.datasets[1].data = [];
    lineChart.options.percentileLines = [...(snapshot.percentileLines || [])];
    lineChart.update();

    histogram.data.labels = [...snapshot.histogramLabels];
    histogram.data.datasets[0].data = [...snapshot.histogramData];
    histogram.options.verticalLines = [...(snapshot.histogramVerticalLines || [])];
    histogram.options.verticalLinesOffset = snapshot.histogramVerticalLinesOffset || 0;
    histogram.update();

    document.querySelectorAll('.scenario.instance').forEach(el => el.classList.remove('selected'));
    document.getElementById(`scenario-${scenarioId}`)!.classList.add('selected');
}

function createScenarioContainer(scenario: any) {
    const template = document.querySelector('#scenario-template') as HTMLTemplateElement;

    const clone = (template.content.cloneNode(true) as DocumentFragment).querySelector('ul')!;
    clone.setAttribute('id', `scenario-${scenario.id}`);
    clone.querySelector('.scenario-title')!.textContent = scenario.title;
    return clone
}

function parse(form: HTMLFormElement) {
  const field = (fieldName: string) => (form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement).value;

  return parseInput({
      title: field('workload'),
      workers: field('workers'),
      workload: field('workload'),
      wipLimit: field('wip-limit'),
      numberOfStories: field('numberOfStories'),
      random: (form.querySelector('[name="random"]') as HTMLInputElement).checked
  });
}

function parseScenario(event: Event) {
  return Scenario(parse(event.target as HTMLFormElement));
}

document.addEventListener('DOMContentLoaded', () => {
    const form = FormHelper.initialize();

    document.getElementById('new-scenario')!
      .addEventListener('submit', (event: Event) => {
        event.preventDefault()
        if(!form.isValid()) return;

        const scenario = parseScenario(event);
        const $container = createScenarioContainer(scenario);
        const $scenarios = document.getElementById('scenarios')!;

        const $lastScenario = document.getElementsByClassName('scenario instance')[0] ?? null;
        $scenarios.insertBefore($container, $lastScenario);

        $container.addEventListener('click', () => restoreSnapshot(scenario.id));

        document.querySelectorAll('.scenario.instance').forEach(el => el.classList.remove('selected'));
        $container.classList.add('selected');

        run(scenario);
      })
});

const wipLimiter = LimitBoardWip();


let lineChart: any = undefined;
let cfd: any = undefined;
let histogram: any = undefined;

function run(scenario: any) {
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

    if(histogram) histogram.destroy()
    histogram = HistogramChart(document.getElementById('histogram'))

    const board = scenario.run();
    captureSnapshot(scenario.id);
}

export {};
