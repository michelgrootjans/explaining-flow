require('./animation').initialize();
const {generateWorkItems, randomBetween} = require('./generator');

const {Worker, WorkList} = require('./worker');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();


TimeAdjustments.speedUpBy(20);

let board = new Board(
  new WorkList('ux'),
  new WorkList('be'),
  new WorkList('fe'),
  new WorkList('qa'),
);

board.addWorkers(
  new Worker({ux: randomBetween(0.8, 1.2)}),
  new Worker({be: randomBetween(0.8, 1.2)}),
  new Worker({fe: randomBetween(0.8, 1.2)}),
  new Worker({qa: randomBetween(0.8, 1.2)}),
);

board.addWorkItems(...generateWorkItems(() => ({
    ux: randomBetween(0.1, 1.9),
    be: randomBetween(0.1, 1.9),
    fe: randomBetween(0.1, 1.9),
    qa: randomBetween(0.1, 1.9),
  })
));