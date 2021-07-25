const $ = require('jquery');

require('./animation').initialize(currentStatsContainerId);
const {generateWorkItems, randomBetween, averageOf} = require('./generator');
const {Worker} = require('./worker');
const {LimitBoardWip} = require('../src/strategies');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();
const WorkerStats = require('./worker-stats');
new WorkerStats();
const average = averageOf

const scenarios = [
  {
    id:1,
    title: 'dev 1',
    workers: ['dev'],
    stories: {
      amount: 50,
      work: {'dev': 1}
    }
  },
  {
    id:2,
    title: 'dev variable',
    workers: ['dev'],
    stories: {
      amount: 50,
      work: {'dev': 1},
      distribution: average
    }
  },
  {
    id:3,
    title: 'dev and qa',
    workers: ['dev', 'qa'],
    stories: {
      amount: 50,
      work: {'dev': 1, 'qa': 1},
      distribution: average
    }
  },
  {
    id:4,
    title: 'ux, dev and qa',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 1, 'qa': 1},
      distribution: average
    },
    speed: 20
  },
  {
    id:5,
    title: 'ux: 1, dev: 2, ux: 1.5',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20
  },
  {
    id:6,
    title: '2nd developer',
    workers: ['ux', 'dev', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20
  },
  {
    id:7,
    title: 'limit WIP to 10',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20,
    wipLimit: 10
  },
  {
    id:8,
    title: 'limit WIP to 4',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20,
    wipLimit: 4
  },
  {
    id:9,
    title: 'limit WIP to 2',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20,
    wipLimit: 2
  },
  {
    id:10,
    title: 'fullstack',
    workers: ['all', 'all', 'all'],
    stories: {
      amount: 200,
      work: {'ux': 1, 'dev': 2, 'qa': 1.5},
      distribution: average
    },
    speed: 20
  },
]

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
});

const wipLimiter = LimitBoardWip(1000);

function run(scenario) {
  currentScenario = scenario
  document.title = scenario.title || 'Flow simulation'
  TimeAdjustments.speedUpBy(scenario.speed || 1);
  wipLimiter.updateLimit(scenario.wipLimit || scenario.stories.amount)

  let board = new Board([...new Set(scenario.workers)])

  function createWorker(skillName, speed = 1) {
    let skills = {};
    skills[skillName] = speed
    return new Worker(skills);
  }

  board.addWorkers(
    ...(scenario.workers.map(name => createWorker(name)))
  );

  function generateStory() {
    const story = {}
    let distribute = scenario.stories.distribution || (identity => identity);
    Object.keys(scenario.stories.work).forEach(key => {
      let givenValue = scenario.stories.work[key];
      story[key] = distribute(givenValue);
    });
    return story;
  }

  board.addWorkItems(...generateWorkItems(generateStory, scenario.stories.amount));
}

