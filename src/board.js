const {WorkList} = require('./worker');

(function () {
  let Board = function (...c) {
    const columns = [];
    const workers = [];
    const backlogColumn = () => columns[0];
    const firstWorkColumn = () => columns[1];
    const doneColumn = () => columns[columns.length-1];

    columns.push(new WorkList('Backlog'));
    for (let i = 0; i < c.length; i++) {
      columns.push(c[i]);
      columns.push(new WorkList('-'));
    }
    doneColumn().name = 'Done';

    for (let i = 0; i < columns.length; i++) {
      if (i % 2 === 0) {
        let queueColumn = columns[i];
        queueColumn.type = 'queue';
        queueColumn.workColumn = columns[i + 1];
      } else {
        let workColumn = columns[i];
        workColumn.type = 'work';
        workColumn.inbox = columns[i - 1];
        workColumn.outbox= columns[i + 1];
      }
    }

    PubSub.publish('board.ready', {columns});

    const addWorkers = (...newWorkers) => newWorkers.forEach(worker => workers.push(worker));
    const addWorkItems = (...items) => items.forEach(item => backlogColumn().add(item));

    PubSub.subscribe('worker.idle', (topic, worker) => {
      // console.log({topic, worker: worker.id});
      for (let i = 1; i < columns.length - 1; i += 2) {
        const inbox = columns[i - 1];
        const workColumn = columns[i];
        let outbox = columns[i + 1];
        const availableWorker = workers.filter(worker => worker.isIdle())
          .filter(worker => worker.canDo(workColumn.necessarySkill))[0];
        if (availableWorker) {
          worker.startWorkingOn(inbox, workColumn, outbox)
        }
      }
    });

    PubSub.subscribe('workitem.added', (topic, subject) => {
      // console.log({topic, column: subject.column.id, item: subject.item.id});
      if(subject.column.type === 'work') return;
      workers.forEach(worker => {
        for (let i = 1; i < columns.length - 1; i += 2) {
          const inbox = columns[i - 1];
          const workColumn = columns[i];
          let outbox = columns[i + 1];
          if (!inbox.hasWork()) continue;
          const availableWorker = workers.filter(worker => worker.isIdle())
            .filter(worker => worker.canDo(workColumn.necessarySkill))[0];
          if (availableWorker) {
            availableWorker.startWorkingOn(inbox, workColumn, outbox);
            return;
          }
        }
      })
    });

    PubSub.subscribe('workitem.added', (topic, subject) => {
      const item = subject.item;
      if (subject.column.id === firstWorkColumn().id) {
        item.startTime = Date.now();
        PubSub.publish('workitem.started', item);
      }
      if (subject.column.id === doneColumn().id) {
        item.endTime = Date.now();
        item.duration = item.endTime - item.startTime;
        PubSub.publish('workitem.finished', item);
        // console.log({item: item})
      }
    });

    return {
      addWorkers,
      addWorkItems,
      items: () => columns.map(column => column.items())
    }
  };

  module.exports = Board
})();