const BoardFactory = require("./boardFactory");
const PubSub = require("pubsub-js");

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
    PubSub.publish('board.ready', {columns});
  }

  initialize(workColumnNames);

  PubSub.subscribe('workitem.added', (topic, subject) => {
    assignNewWorkIfPossible();
  });

  PubSub.subscribe('board.allowNewWork', (topic, subject) => {
    allowNewWork = true;
    assignNewWorkIfPossible();
  });

  function assignNewWorkIfPossible() {
    const nextWork = findNextWork();

    const columnWithWork = nextWork && nextWork.column;
    const itemToWorkOn = nextWork && nextWork.item;

    if (columnWithWork) {
      if (columnWithWork.inbox === backlogColumn() && !allowNewWork)
        return;

      const workCriteria = { skill: columnWithWork.necessarySkill, item: itemToWorkOn };

      const availableWorker = workers
        .filter(worker => worker.canWorkOn(workCriteria))
        .reduce((bestCandidate, worker) => {
          if (!bestCandidate) return worker;
          const bestScore = bestCandidate.canWorkOn(workCriteria);
          const currentScore = worker.canWorkOn(workCriteria);
          return bestScore > currentScore ? bestCandidate : worker;
        });

      if (availableWorker) {
        availableWorker.startWorkingOn(columnWithWork.inbox, columnWithWork, columnWithWork.outbox);
      }
    }
  }

  function findNextWork() {
    return workColumns()
        .reverse()
        .filter(column => column.inbox.hasWork())
        .map(column => ({ column, item: findFirstWorkableItemIn(column) }))
        .filter(result => !!result.item)[0];
  }

  function findFirstWorkableItemIn(column) {
    return column.inbox.items().filter(item => workers.some(worker => worker.canWorkOn({ skill: column.necessarySkill, item })))[0]
  }

  PubSub.subscribe('board.denyNewWork', () => allowNewWork = false);

  PubSub.subscribe('workitem.added', (topic, {item, column}) => {
    if (column.id === firstWorkColumn().id) {
      item.startTime = Date.now();
      PubSub.publish('workitem.started', item);
    }
    if (column.id === doneColumn().id) {
      item.endTime = Date.now();
      item.duration = item.endTime - item.startTime;
      PubSub.publish('workitem.finished', item);
      if (done())
        PubSub.publish('board.done', {board});
    }
  });

  return board
};

module.exports = Board
