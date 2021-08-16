const PubSub = require('pubsub-js');
const scenarios = require('./scenarios')
const Animation = require('./animation');
const {LimitBoardWip} = require('../src/strategies');
const TimeAdjustments = require('./timeAdjustments');
const Stats = require('./stats');
const WorkerStats = require('./worker-stats');
const Scenario = require("./scenario");
const LineChart = require("./charts");

function createScenarioContainer(scenario) {
    const template = document.querySelector('#scenario-template');

    const clone = template.content.cloneNode(true).querySelector('div');
    clone.setAttribute('id', `scenario-${scenario.id}`);
    clone.querySelector('.scenario-title').textContent = scenario.title;
    return clone
}

function parseWorkload(input) {
  return input
    .trim()
    .split(',')
    .map(pair => pair
      .trim()
      .split(":")
    )
    .reduce((work, pair) => {
      work[pair[0].trim()] = parseInt(pair[1].trim());
      return work;
    }, {})
}

const split = value => value.trim().split(",").map(item => item.trim());

function parse(form) {
  const field = fieldName => form.querySelector(`[name="${fieldName}"]`).value;

  const title = field('title');
  const workers = split(field('workers'));
  const work = parseWorkload(field('workload'));
  const wipLimit = field('wip-limit');

  console.log({workers, work})
  let input = {
    title,
    workers,
    stories: {
      amount: (workers.length > 2) ? 200 : 50,
      work
    },
    wipLimit,
    speed: (workers.length > 2) ? 20 : 1
  };
  if (form.querySelector('[name="random"]').checked) input.distribution = average
  input.wipLimit = form.querySelector('[name="wip-limit"]').value
  return input;
}

document.addEventListener('DOMContentLoaded', () => {
    scenarios.forEach(input => {
        // const scenario = Scenario(input);
        //
        // let $scenario = createScenarioContainer(scenario);
        // $scenario.addEventListener('click', () => run(scenario))
        // document.getElementById('scenarios').append($scenario)
    })
    document.getElementById('new-scenario')
      .addEventListener('submit', event => {
        event.preventDefault()
        const scenario = Scenario(parse(event.target));
        document.getElementById('scenarios').append(createScenarioContainer(scenario))
        run(scenario);
      })
});

const wipLimiter = LimitBoardWip();


const CurrentStats = require("./cfd");
const CumulativeFlowDiagram = require("./CumulativeFlowDiagram");
const {average} = require("./generator");

function run(scenario) {
    PubSub.clearAllSubscriptions();

    Animation.initialize(`#scenario-${scenario.id}`);
    Stats.initialize();

    new WorkerStats();
    document.title = scenario.title
    TimeAdjustments.speedUpBy(scenario.speed || 1);

    wipLimiter.initialize(scenario.wipLimit)
    const board = scenario.run();

    LineChart(document.getElementById('myChart'), 2000)
    // const stats = CurrentStats(board.columns());
    // stats.init();
    // CumulativeFlowDiagram(document.getElementById('myChart'), stats);
}

