(function () {
  let Board = function (...columns) {
    let workers = [];

    let addWorkers = (...newWorkers) => {
      newWorkers.forEach(worker => {
        for (let i = 1; i < columns.length; i += 2) {
          if (worker.canDo(columns[i].necessarySkill)) {
            worker.assignColumns(columns[i-1], columns[i], columns[i+1])
          }
        }
        workers.push(worker);
      });
    };

    const backlog = () => columns[0];
    const done = () => columns[columns.length-1];

    let addWorkItems = (...items) => items.forEach(item => backlog().add(item));
    let runSimulation = () => workers.forEach(worker => {
      worker.work();
    });

    PubSub.subscribe('worker.idle', (topic, worker) => {
      worker.work();
    });

    PubSub.subscribe('workitem.added', (topic, subject) => {
      let availableWorker = workers.filter(worker => worker.isIdle())
        .filter(worker => worker.canDo(subject.column.necessarySkill))[0];
      if (availableWorker) {
        availableWorker.workOn(topic.item);
      }
    });

    PubSub.subscribe('workitem.added', (topic, subject) => {
      if (subject.column.id === done().id) {
        subject.item.endTime = Date.now();
        PubSub.publish('workitem.finished', subject.item);
      }
    });

    PubSub.subscribe('workitem.removed', (topic, subject) => {
      if (subject.column.id === backlog().id) {
        subject.item.startTime = Date.now();
        PubSub.publish('workitem.started', subject.item);
      }
    });


    return {
      addWorkers,
      addWorkItems,
      runSimulation,
      items: () => columns.map(column => column.items())
    }
  };

  module.exports = Board
})();