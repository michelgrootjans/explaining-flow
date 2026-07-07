import BoardFactory from './boardFactory';
import PubSub from 'pubsub-js';

let Board = function (workColumnNames: string[], initialWipLimit?: any) {
  let columns: any[] = [];
  const workers: any[] = [];
  const backlogColumn = () => columns[0];
  const firstWorkColumn = () => columns[1];
  const doneColumn = () => columns[columns.length - 1];
  const size = () => columns.map(column => column.size())
    .reduce((totalSize, size) => totalSize + size);
  const done = () => doneColumn().size() === size();
  const workColumns = () => columns.filter(column => column.type === 'work');
  const addWorkers = (...newWorkers: any[]) => newWorkers.forEach(worker => workers.push(worker));
  const addWorkItems = (...items: any[]) => items.forEach(item => backlogColumn().add(item));
  let allowNewWork = true;
  // The limit must be known synchronously from the start: the deny/allow events
  // from the WIP strategy arrive asynchronously, so during a burst (especially
  // the opening flood of the backlog) the board must check the limit itself at
  // assignment time or it overshoots by a card or two.
  let wipLimit: number | null = Number.isFinite(Number(initialWipLimit)) && Number(initialWipLimit) > 0
    ? Number(initialWipLimit) : null;
  const inFlight = () => size() - backlogColumn().size() - doneColumn().size();

  const board = {
    addWorkers,
    addWorkItems,
    columns: () => columns,
    items: () => columns.map(column => column.items()),
    size,
    done
  };

  function initialize(workColumnNames: string[]) {
    const factory = new BoardFactory();
    columns = factory.createColumns(workColumnNames);
    PubSub.publish('board.ready', {columns});
  }

  initialize(workColumnNames);

  PubSub.subscribe('workitem.added', (topic: string, subject: any) => {
    assignNewWorkIfPossible();
  });

  PubSub.subscribe('board.allowNewWork', (topic: string, subject: any) => {
    const limit = Number(subject && subject.limit);
    if (Number.isFinite(limit) && limit > 0) wipLimit = limit;
    allowNewWork = true;
    assignNewWorkIfPossible();
  });

  function assignNewWorkIfPossible() {
    const columnWithWork = workColumns()
      .reverse()
      .filter(column => column.inbox.hasWork())
      .filter(column => workers.some(worker => worker.canWorkOn(column.necessarySkill)))[0];

    if (columnWithWork) {
      if (columnWithWork.inbox === backlogColumn()) {
        if (!allowNewWork) return;
        if (wipLimit !== null && inFlight() >= wipLimit) return;
      }

      const availableWorker = workers
        .filter(worker => worker.canWorkOn(columnWithWork.necessarySkill))
        .reduce((bestCandidate: any, worker: any) => {
          if (!bestCandidate) return worker;
          const bestScore = bestCandidate.canWorkOn(columnWithWork.necessarySkill);
          const currentScore = worker.canWorkOn(columnWithWork.necessarySkill);
          return bestScore > currentScore ? bestCandidate : worker;
        });

      if (availableWorker) {
        availableWorker.startWorkingOn(columnWithWork.inbox, columnWithWork, columnWithWork.outbox);
      }
    }
  }

  PubSub.subscribe('board.denyNewWork', () => allowNewWork = false);

  PubSub.subscribe('workitem.added', (topic: string, {item, column}: any) => {
    if (column.id === firstWorkColumn().id) {
      item.startTime = Date.now();
      // True concurrency sampled from board state — event-delivery order can
      // lag under browser timer clamping, so counters built from deliveries
      // may transiently overshoot. This is the authoritative number.
      item.inFlightAtStart = inFlight();
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

export default (Board as any);
