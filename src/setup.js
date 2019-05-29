const $ = require('jquery');
require('./animation').initialize();

const {Worker, WorkItem, WorkList, Backlog, DoneList} = require('./worker');
const Board = require('./board');
const TimeAdjustments = require('./timeAdjustments');

TimeAdjustments.speedUpBy(20);

let board = new Board(
  new Backlog(),
  new WorkList('dev'),
  new DoneList()
);

board.addWorkers(
  new Worker({dev: 1}),
);

function randomDuration(average=1.0, spread=0.2) {
  return average + (Math.random() - 0.5) * spread;
}

board.addWorkItems(...
  [...Array(100).keys()]
    .map(() => new WorkItem({
        ux: randomDuration(),
        dev: randomDuration(),
        qa: randomDuration(),
      })
    ));

board.runSimulation();
