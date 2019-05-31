const TimeAdjustments = require('./timeAdjustments');
const PubSub = require('pubsub-js');

(function () {
  function initialize() {
    let wip = 0;
    let maxEndtime = 0;
    let minStarttime = Math.min();
    let doneItems = [];
    let sumOfDurations = 0;

    function calculateThroughput(items) {
      if(items.length === 0) return 0;
      const minTime = items.map(item => item.startTime)
        .reduce((oldest, current) => oldest < current ? oldest : current);
      const maxTime = items.map(item => item.endTime)
        .reduce((newest, current) => newest > current ? newest : current);
      return items.length / ((maxTime - minTime) / 1000);
    }
    function calculateAllThroughput() {
      if (doneItems.length === 0) return 0;
      return doneItems.length / ((maxEndtime - minStarttime) / 1000);
    }

    function calculateLeadTime(items) {
      if(items.length === 0) return 0;
      let averageDuration = items.map(item => (item.endTime - item.startTime) / 1000)
        .reduce((sum, duration) => sum + duration, 0);
      return averageDuration / items.length;
    }

    function calculateAllLeadTime() {
      if (doneItems.length === 0) return 0;
      return sumOfDurations / (doneItems.length * 1000);
    }

    function lastNumberOfItems(numberOfItems) {
      return doneItems.slice(doneItems.length - numberOfItems);
    }

    function throughputForLast(numberOfItems) {
      return calculateThroughput(lastNumberOfItems(numberOfItems)) * TimeAdjustments.multiplicator();
    }

    function leadTimeForLast(numberOfItems) {
      return calculateLeadTime(lastNumberOfItems(numberOfItems)) / TimeAdjustments.multiplicator();
    }

    function publishStats() {
      PubSub.publish('stats.calculated', {
        throughput: calculateAllThroughput(doneItems) * TimeAdjustments.multiplicator(),
        leadTime: calculateAllLeadTime(doneItems) / TimeAdjustments.multiplicator(),
        workInProgress: wip,
        sliding: {
          throughput: throughputForLast,
          leadTime: leadTimeForLast,
        }
      });
    }

    PubSub.subscribe('workitem.started', (topic, item) => {
      wip++;
      publishStats();
    });

    PubSub.subscribe('workitem.finished', (topic, item) => {
      wip--;
      maxEndtime = Math.max(maxEndtime, item.endTime);
      minStarttime = Math.min(minStarttime, item.startTime);
      sumOfDurations += (item.endTime - item.startTime)
      doneItems.push(item);
      publishStats();
    });

  }

  module.exports = {
    initialize
  };
})();
