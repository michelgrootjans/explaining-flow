const PubSub = require('pubsub-js');

(function () {
  function WorkerStats(){

    function calculateEfficiencyFor(history) {
      if (history.length === 1 && history[0].state === 'idle') return 0;
      if (history.length === 1 && history[0].state === 'working') return 1;

      let working = 0;
      let idle = 0;
      for (let i = 0; i < history.length - 1; i++) {
        if (history[i].state === 'idle') {
          idle += history[i+1].timestamp - history[i].timestamp
        } else {
          working += history[i+1].timestamp - history[i].timestamp
        }
      }

      if(working === 0 && idle === 0) return 0;
      return working/(working + idle);
    }

    function calculateStatsFor(worker) {
      return {
        workerId: worker.id,
        stats: {efficiency: calculateEfficiencyFor(workersHistory[worker.id])}
      };
    }

    const workersHistory = {};

    PubSub.subscribe('worker.created', (topic, worker) => {
      workersHistory[worker.id] = [];
      PubSub.publish('worker.stats.updated', calculateStatsFor(worker))
    });

    PubSub.subscribe('worker.idle', (topic, worker) => {
      workersHistory[worker.id].push({timestamp: Date.now(), state: 'idle'});
      PubSub.publish('worker.stats.updated', calculateStatsFor(worker))
    });

    PubSub.subscribe('worker.working', (topic, worker) => {
      workersHistory[worker.id].push({timestamp: Date.now(), state: 'working'});
      PubSub.publish('worker.stats.updated', calculateStatsFor(worker))
    });

    return {}
  }

  module.exports = WorkerStats;
})();