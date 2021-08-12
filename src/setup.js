const PubSub = require('pubsub-js');
const scenarios = require('./scenarios')

const $ = require('jquery');

const Animation = require('./animation');
const {LimitBoardWip} = require('../src/strategies');
const TimeAdjustments = require('./timeAdjustments');
const Stats = require('./stats');
const WorkerStats = require('./worker-stats');
const Scenario = require("./scenario");
const LineChart = require("./charts");

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

document.addEventListener('DOMContentLoaded', () => {
  scenarios.forEach(scenario => {
    let $scenario = createScenarioContainer(scenario);
    $scenario.on('click', () => run(scenario))
    $('#scenarios').append($scenario);
  })
});

const wipLimiter = LimitBoardWip();


const CurrentStats = require("./cfd");
const CumulativeFlowDiagram = require("./CumulativeFlowDiagram");

function run(scenario) {
  PubSub.clearAllSubscriptions();
  Animation.initialize(`#scenario-${scenario.id}`);
  Stats.initialize();
  new WorkerStats();

  document.title = scenario.title || 'Flow simulation'
  TimeAdjustments.speedUpBy(scenario.speed || 1);
  wipLimiter.initialize(scenario.wipLimit || scenario.stories.amount)

  const board = Scenario(scenario).run();

  LineChart(document.getElementById('myChart'), 2000)
  // const stats = CurrentStats(board.columns());
  // stats.init();
  // CumulativeFlowDiagram(document.getElementById('myChart'), stats);
}

