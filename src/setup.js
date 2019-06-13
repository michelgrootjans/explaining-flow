require('./animation').initialize();
const {generateWorkItems, randomBetween} = require('./generator');
const {Worker, WorkList} = require('./worker');
const {LimitBoardWip, DynamicLimitBoardWip, WipUp} = require('../src/strategies');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();
const WorkerStats = require('./worker-stats');

new WorkerStats();
TimeAdjustments.speedUpBy(1);

let board = new Board(
  new WorkList('ux'),
  new WorkList('dev'),
  new WorkList('qa'),
);

board.addWorkers(
  new Worker({ux: 1}),
  new Worker({dev: 1}),
  new Worker({qa: 1}),
);

board.addWorkItems(...generateWorkItems(() => ({
    ux: randomBetween(0,2),
    dev: randomBetween(0,2),
    qa: randomBetween(0,2),
  }), 50
));

