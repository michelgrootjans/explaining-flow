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
    let addWorkItems = (...items) => items.forEach(item => columns[0].add(item));
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


    return {
      addWorkers,
      addWorkItems,
      runSimulation,
      items: () => columns.map(column => column.items())
    }
  };

  module.exports = Board
})();