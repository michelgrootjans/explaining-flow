const PubSub = require('pubsub-js');
const scenarios = require('./scenarios')
const Animation = require('./animation');
const {LimitBoardWip} = require('../src/strategies');
const TimeAdjustments = require('./timeAdjustments');
const Stats = require('./stats');
const WorkerStats = require('./worker-stats');
const Scenario = require("./scenario");
const LineChart = require("./charts");
const {parseInput} = require("./parsing");

// force repeatable randomness
const seedrandom = require('seedrandom');

function createScenarioContainer(scenario) {
    const template = document.querySelector('#scenario-template');

    const clone = template.content.cloneNode(true).querySelector('div');
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
      random: form.querySelector('[name="random"]').checked
  });
}

function parseScenario(event) {
  return Scenario(parse(event.target));
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
        const scenario = parseScenario(event);
          const container = createScenarioContainer(scenario);
          document.getElementById('scenarios').append(container)
        run(scenario);
      })
});

const wipLimiter = LimitBoardWip();


let currentChart = undefined;

function run(scenario) {
    PubSub.clearAllSubscriptions();

    // force predicatable randomness
    seedrandom('limit wip', {global: true});
    console.log(Math.random())
    console.log(Math.random())

  Animation.initialize(`#scenario-${scenario.id}`);
    Stats.initialize();

    new WorkerStats();
    document.title = scenario.title
    TimeAdjustments.speedUpBy(scenario.speed || 1);

    wipLimiter.initialize(scenario.wipLimit)
    if(currentChart) currentChart.destroy()
    currentChart = LineChart(document.getElementById('myChart'), 2000, scenario.speed)

    const board = scenario.run();
}

