const scenarios = require('./scenarios')

const $ = require('jquery');

require('./animation').initialize(currentStatsContainerId);
const {LimitBoardWip} = require('../src/strategies');
require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();
const WorkerStats = require('./worker-stats');
const Scenario = require("./scenario");
const LineChart = require("./charts");
new WorkerStats();

function createScenarioContainer(scenario) {
  return $('<div/>')
    .attr('id', `scenario-${scenario.id}`)
    .addClass('scenario')
    .append($('<div/>').addClass('scenario-title').text(scenario.title))
    .append($('<div/>').addClass('throughput'))
    .append($('<div/>').addClass('leadtime'))
    .append($('<div/>').addClass('wip'))
    .append($('<div/>').addClass('workers'))
}

let currentScenario = undefined;

function currentStatsContainerId() {
  return `#scenario-${currentScenario.id}`
}

document.addEventListener('DOMContentLoaded', () => {
  scenarios.forEach(scenario => {
    let $scenario = createScenarioContainer(scenario);
    $scenario.on('click', () => run(scenario))
    $('#scenarios').append($scenario);
  })
  LineChart(document.getElementById('myChart'));
});

const wipLimiter = LimitBoardWip(1000);

function run(scenario) {
  currentScenario = scenario
  document.title = scenario.title || 'Flow simulation'
  TimeAdjustments.speedUpBy(scenario.speed || 1);
  wipLimiter.updateLimit(scenario.wipLimit || scenario.stories.amount)

  Scenario(scenario).run();
}

