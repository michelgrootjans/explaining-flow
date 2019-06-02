require('./animation').initialize();
const {generateWorkItems, randomBetween} = require('./generator');
const {Worker, WorkList} = require('./worker');
const {LimitBoardWip} = require('../src/strategies');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();


TimeAdjustments.speedUpBy(1);

let board = new Board(
  new WorkList('dev'),
  new WorkList('qa'),
);

new LimitBoardWip(2);

board.addWorkers(
  new Worker({dev: 1}),
  new Worker({qa: 1}),
);

board.addWorkItems(...generateWorkItems(() => ({
    dev: 1,
    qa: 1.5,
  }), 3
));