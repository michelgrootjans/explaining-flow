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
  const field = fieldName => form.querySelector(`[name="${fieldName}"]`);
  const fieldValue = fieldName => field(fieldName).value;
  const isChecked = fieldName => field(fieldName).checked;

  return parseInput({
      title: fieldValue('workload'),
      workers: fieldValue('workers'),
      workload: fieldValue('workload'),
      wipLimit: fieldValue('wip-limit'),
      workOnUniqueItems: isChecked('unique-items'),
      random: isChecked('random'),
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
        const $scenarios = document.getElementById('scenarios');
        // $scenarios.append(container)

        const $lastScenario = document.getElementsByClassName('scenario instance')[0];
        $scenarios.insertBefore(container, $lastScenario);

        run(scenario);
      })
});

const wipLimiter = LimitBoardWip();


let currentChart = undefined;

function run(scenario) {
    PubSub.clearAllSubscriptions();

    // force predicatable randomness
    seedrandom('limit work in progress', {global: true});

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

