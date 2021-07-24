require('./animation').initialize();
const {generateWorkItems, randomBetween, averageOf} = require('./generator');
const {Worker, WorkList} = require('./worker');
const {LimitBoardWip, DynamicLimitBoardWip, WipUp} = require('../src/strategies');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();
const WorkerStats = require('./worker-stats');

new WorkerStats();
TimeAdjustments.speedUpBy(20);

function oneDeveloper() {
  debugger
  let board = new Board(
    new WorkList('dev'),
  );

  board.addWorkers(
    new Worker({dev: 1}),
  );

  board.addWorkItems(...generateWorkItems(() => ({
      dev: 1,
    }), 50
  ));
}

function addQA() {
  debugger
  let board = new Board(
    new WorkList('dev'),
    new WorkList('qa'),
  );

  board.addWorkers(
    new Worker({dev: 1}),
    new Worker({qa: 1}),
  );

  board.addWorkItems(...generateWorkItems(() => ({
      dev: 1,
      qa: 1,
    }), 50
  ));
}

document.addEventListener('DOMContentLoaded', event => {
  let currentScenario = 0;
  const scenarios = [oneDeveloper, addQA]
  document.querySelector("#numbers").addEventListener('click', () => {
    debugger
    scenarios[currentScenario]();
    currentScenario++;
  });
});
