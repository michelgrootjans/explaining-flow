const PubSub = require('pubsub-js');

(function () {
  function LimitBoardWip(originalLimit = 1) {
    let limit = originalLimit;
    let wip = 0;

    PubSub.publish('board.allowNewWork', {wip, limit});

    PubSub.subscribe('workitem.started', () => {
      wip++;
      if (wip >= limit) PubSub.publish('board.denyNewWork', {wip, limit});
    });
    PubSub.subscribe('workitem.finished', () => {
      wip--;
      if (wip < limit) PubSub.publish('board.allowNewWork', {wip, limit});
    });

    return {
      updateLimit: newLimit => limit = newLimit,
      limit: () => limit
    };
  }

  function DynamicLimitBoardWip() {
    let measurements = [];
    let counter = 0;
    let optimized = false;
    let limiter = new LimitBoardWip(1);


    PubSub.subscribe('stats.calculated', (topic, stats) => {
      if(optimized)
        return;
      if(stats.workInProgress === limiter.limit())
        counter++;
      if (counter >= 50) {
        counter = 0;
        key = stats.sliding.leadTime(10) / stats.sliding.throughput(10);
        const newMeasurement = {limit: limiter.limit(), key};
        measurements.push(newMeasurement);

        if (measurements.length < 10) {
          limiter.updateLimit(limiter.limit()+1);
          return;
        }

        let bestMeasurement = measurements[0];
        for (let i = 0; i < measurements.length; i++) {
          if(measurements[i].key < bestMeasurement.key) bestMeasurement = measurements[i];
        }
        if (bestMeasurement !== newMeasurement) {
          optimized = true;
          limiter.updateLimit(bestMeasurement.limit);
          console.log({bestMeasurement})
          console.log({measurements})
        } else {
          limiter.updateLimit(limiter.limit() + 1);
        }
      }
    });


    return {};
  }

  function WipUp(step=10) {
    let counter = 0;
    let wipLimit = 1;
    let limiter = new LimitBoardWip(wipLimit);


    PubSub.subscribe('workitem.finished', () => {
      counter++;
      if (counter % step == 0) {
        wipLimit++;
        limiter.updateLimit(wipLimit);
      }
    });


    return {};
  }

  module.exports = {LimitBoardWip, DynamicLimitBoardWip, WipUp}
})();
