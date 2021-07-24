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

oneDeveloper();
