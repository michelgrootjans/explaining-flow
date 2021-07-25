const TimeAdjustments = require('./timeAdjustments');
const PubSub = require('pubsub-js');

(function () {
  function initialState() {
    return {
      wip: 0,
      maxWip: 0,
      maxEndtime: 0,
      minStarttime: Math.min(),
      doneItems: [],
      sumOfDurations: 0
    };
  }

  function initialize() {
    let state = undefined;

    function calculateThroughput(items) {
      if(items.length === 0) return 0;
      const minTime = items.map(item => item.startTime)
        .reduce((oldest, current) => oldest < current ? oldest : current);
      const maxTime = items.map(item => item.endTime)
        .reduce((newest, current) => newest > current ? newest : current);
      return items.length / ((maxTime - minTime) / 1000);
    }
    function calculateAllThroughput() {
      if (state.doneItems.length === 0) return 0;
      return state.doneItems.length / ((state.maxEndtime - state.minStarttime) / 1000);
    }

    function calculateLeadTime(items) {
      if(items.length === 0) return 0;
      let averageDuration = items.map(item => (item.endTime - item.startTime) / 1000)
        .reduce((sum, duration) => sum + duration, 0);
      return averageDuration / items.length;
    }

    function calculateAllLeadTime() {
      if (state.doneItems.length === 0) return 0;
      return state.sumOfDurations / (state.doneItems.length * 1000);
    }

    function lastNumberOfItems(numberOfItems) {
      return state.doneItems.slice(state.doneItems.length - numberOfItems);
    }

    function throughputForLast(numberOfItems) {
      return calculateThroughput(lastNumberOfItems(numberOfItems)) * TimeAdjustments.multiplicator();
    }

    function leadTimeForLast(numberOfItems) {
      return calculateLeadTime(lastNumberOfItems(numberOfItems)) / TimeAdjustments.multiplicator();
    }

    function publishStats() {
      PubSub.publish('stats.calculated', {
        throughput: calculateAllThroughput(state.doneItems) * TimeAdjustments.multiplicator(),
        leadTime: calculateAllLeadTime(state.doneItems) / TimeAdjustments.multiplicator(),
        workInProgress: state.wip,
        maxWorkInProgress: state.maxWip,
        sliding: {
          throughput: throughputForLast,
          leadTime: leadTimeForLast,
        }
      });
    }

    PubSub.subscribe('board.ready', () => {
      state = initialState()
    });

    PubSub.subscribe('workitem.started', () => {
      state.wip++;
      state.maxWip = Math.max(state.wip, state.maxWip)
      publishStats();
    });

    PubSub.subscribe('workitem.finished', (topic, item) => {
      state.wip--;
      state.maxEndtime = Math.max(state.maxEndtime, item.endTime);
      state.minStarttime = Math.min(state.minStarttime, item.startTime);
      state.sumOfDurations += (item.endTime - item.startTime)
      state.doneItems.push(item);
      publishStats();
    });

  }

  module.exports = {
    initialize
  };
})();
