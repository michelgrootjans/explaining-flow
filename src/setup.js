require('./animation').initialize();
const {generateWorkItems, randomBetween} = require('./generator');
const {Worker, WorkList} = require('./worker');
const {LimitBoardWip, DynamicLimitBoardWip, WipUp} = require('../src/strategies');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();
const WorkerStats = require('./worker-stats');

new WorkerStats();
TimeAdjustments.speedUpBy(20);

let board = new Board(
  new WorkList('ux'),
  new WorkList('dev'),
  new WorkList('qa'),
);

board.addWorkers(
  new Worker({ux: randomBetween(0.5, 1.5)}),
  new Worker({dev: randomBetween(0.5, 1.5)}),
  new Worker({qa: randomBetween(0.5, 1.5)}),
);

board.addWorkItems(...generateWorkItems(() => ({
    ux: randomBetween(0, 2),
    dev: randomBetween(0, 2),
    qa: randomBetween(0, 2),
  }), 1000
));

new DynamicLimitBoardWip();
