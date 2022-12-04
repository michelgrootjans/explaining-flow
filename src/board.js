const BoardFactory = require("./boardFactory");
const {publish, subscribe} = require('./publish-subscribe')

const NoLimits = function () {
  return {
    allowsNewWork: () => true
  };
};

let Board = function (workColumnNames) {
  let columns = [];
  const workers = [];
  const backlogColumn = () => columns[0];
  const firstWorkColumn = () => columns[1];
  const doneColumn = () => columns[columns.length - 1];
  const size = () => columns.map(column => column.size())
    .reduce((totalSize, size) => totalSize + size);
  const done = () => doneColumn().size() === size();
  const workColumns = () => columns.filter(column => column.type === 'work');
  const addWorkers = (...newWorkers) => newWorkers.forEach(worker => workers.push(worker));
  const addWorkItems = (...items) => items.forEach(item => backlogColumn().add(item));
  let allowNewWork = true;

  const board = {
    addWorkers,
    addWorkItems,
    columns: () => columns,
    items: () => columns.map(column => column.items()),
    size,
    done
  };

  function initialize(workColumnNames) {
    const factory = new BoardFactory();
    columns = factory.createColumns(workColumnNames);
    publish('board.ready', {columns});
  }

  initialize(workColumnNames);

  subscribe('workitem.added', (topic, {timestamp}) => {
    assignNewWorkIfPossible(timestamp);
  });

  subscribe('board.allowNewWork', (topic, {timestamp}) => {
    allowNewWork = true;
    assignNewWorkIfPossible(timestamp);
  });

  function assignNewWorkIfPossible(timestamp) {
    const columnWithWork = workColumns()
      .reverse()
      .filter(column => column.inbox.hasWork())
      .filter(column => workers.some(worker => worker.canWorkOn(column.necessarySkill)))[0];

    if (columnWithWork) {
      if (columnWithWork.inbox === backlogColumn() && !allowNewWork)
        return;

      const availableWorker = workers
        .filter(worker => worker.canWorkOn(columnWithWork.necessarySkill))
        .reduce((bestCandidate, worker) => {
          if (!bestCandidate) return worker;
          const bestScore = bestCandidate.canWorkOn(columnWithWork.necessarySkill);
          const currentScore = worker.canWorkOn(columnWithWork.necessarySkill);
          return bestScore > currentScore ? bestCandidate : worker;
        });

      if (availableWorker) {
        availableWorker.startWorkingOn(columnWithWork.inbox, columnWithWork, columnWithWork.outbox, timestamp);
      }
    }
  }

  subscribe('board.denyNewWork', () => allowNewWork = false);

  subscribe('workitem.added', (topic, {item, column, timestamp}) => {
    if (column.id === firstWorkColumn().id) {
      item.startTime = timestamp;
      publish('workitem.started', {item, timestamp});
    }
    if (column.id === doneColumn().id) {
      item.endTime = timestamp;
      item.duration = item.endTime - item.startTime;
      publish('workitem.finished', {item, timestamp});
      if (done())
        publish('board.done', {board, timestamp});
    }
  });

  return board
};

module.exports = Board
