require('./animation').initialize();
const {generateWorkItems, randomDuration} = require('./generator');

const {Worker, WorkList} = require('./worker');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');
require('./stats').initialize();


TimeAdjustments.speedUpBy(20);

let board = new Board(
  new WorkList('Backlog'),
  new WorkList('dev'),
  // new WorkList('-'),
  // new WorkList('qa'),
  new WorkList('Done')
);

board.addWorkers(
  new Worker({dev: randomDuration(1, 0.2)}),
  // new Worker({qa: randomDuration(1, 0.2)}),
);

board.addWorkItems(...generateWorkItems({
    dev: randomDuration(),
    // qa: randomDuration()
  },
));

board.runSimulation();
