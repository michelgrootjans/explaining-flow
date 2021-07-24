require('./animation').initialize();
const {generateWorkItems, randomBetween, averageOf} = require('./generator');
const {Worker, WorkList} = require('./worker');
const {LimitBoardWip, DynamicLimitBoardWip, WipUp} = require('../src/strategies');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();
const WorkerStats = require('./worker-stats');

new WorkerStats();
TimeAdjustments.speedUpBy(1);

function oneDeveloper() {
  let board = new Board(['dev'])

  board.addWorkers(
    new Worker({'dev': 1}),
  );

  board.addWorkItems(...generateWorkItems(() => ({
      'dev': 1,
    }), 50
  ));
}

function someRandomness() {
  let board = new Board(['dev'])

  board.addWorkers(
    new Worker({'dev': 1}),
  );

  board.addWorkItems(...generateWorkItems(() => ({
      'dev': averageOf(1),
    }), 50
  ));
}

function addQA() {
  let board = new Board(['dev', 'qa'])

  board.addWorkers(
    new Worker({'dev': 1}),
    new Worker({'qa': 1}),
  );

  board.addWorkItems(...generateWorkItems(() => ({
      'dev': averageOf(1),
      'qa': averageOf(1),
    }), 50
  ));
}

document.addEventListener('DOMContentLoaded', event => {
  let currentScenario = 0;
  const scenarios = [oneDeveloper, someRandomness, addQA]
  document.querySelector("#numbers").addEventListener('click', () => {
    scenarios[currentScenario]();
    currentScenario++;
  });
});
