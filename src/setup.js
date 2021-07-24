require('./animation').initialize();
const {generateWorkItems, randomBetween, averageOf} = require('./generator');
const {Worker, WorkList} = require('./worker');
const {LimitBoardWip, DynamicLimitBoardWip, WipUp} = require('../src/strategies');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();
const WorkerStats = require('./worker-stats');
new WorkerStats();
const average = averageOf

const scenarios = [
  {
    title: 'single developer, predictible work',
    workers: ['dev'],
    stories: {
      amount: 10,
      work: {'dev': 1}
    }
  },
  {
    title: 'single developer, variable work',
    workers: ['dev'],
    stories: {
      amount: 10,
      work: {'dev': 1},
      distribution: average
    }
  },
  {
    title: 'dev and qa',
    workers: ['dev', 'qa'],
    stories: {
      amount: 10,
      work: {'dev': averageOf(1), 'qa': averageOf(1)},
      distribution: average
    }
  },
  {
    title: 'ux, dev and qa',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': averageOf(1), 'dev': averageOf(1), 'qa': averageOf(1)},
      distribution: average
    },
    speed: 20
  },
  {
    title: 'dev is bottleneck',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': averageOf(1), 'dev': averageOf(2), 'qa': averageOf(1.5)},
      distribution: average
    },
    speed: 20
  },
  {
    title: 'second developer',
    workers: ['ux', 'dev', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': averageOf(1), 'dev': averageOf(2), 'qa': averageOf(1.5)},
      distribution: average
    },
    speed: 20
  },
  {
    title: 'limit WIP to 10',
    workers: ['ux', 'dev', 'qa'],
    stories: {
      amount: 200,
      work: {'ux': averageOf(1), 'dev': averageOf(2), 'qa': averageOf(1.5)},
      distribution: average
    },
    speed: 20,
    wipLimit: 10
  },
]

document.addEventListener('DOMContentLoaded', event => {
  let currentScenario = 0;
  document.querySelector("#numbers").addEventListener('click', () => {
    run(scenarios[currentScenario]);
    currentScenario++;
  });
});


function run(scenario) {
  document.title = scenario.title || 'Flow simulation'
  TimeAdjustments.speedUpBy(scenario.speed || 1);
  LimitBoardWip(scenario.wipLimit || scenario.stories.amount)

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
    debugger
    const story = {}
    let calculation = scenario.stories.distribution || (identity => identity);
    Object.keys(scenario.stories.work).forEach(key => {
      story[key] = calculation(scenario.stories.work[key]);
    });
    return story;
  }

  board.addWorkItems(...generateWorkItems(generateStory, scenario.stories.amount
  ));
}
