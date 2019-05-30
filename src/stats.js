const TimeAdjustments = require('./timeAdjustments');
const PubSub = require('pubsub-js');

(function () {
  function initialize() {
    let wip = 0;
    let doneItems = [];

    // const relevantItems = items.filter(item => item.startTime && item.endTime);
    // if (relevantItems.length === 0) return {leadTime: 0, throughput: 0}
    //
    // relevantItems.forEach(item => item.duration = item.endTime - item.startTime);
    // const averageLeadTime = relevantItems.map(item => (item.endTime - item.startTime) / 1000)
    //   .reduce((sum, duration) => sum + duration, 0) / relevantItems.length;
    //
    // const minTime = relevantItems.map(item => item.startTime)
    //   .reduce((oldest, current) => oldest < current ? oldest : current)
    // const maxTime = relevantItems.map(item => item.endTime)
    //   .reduce((newest, current) => newest > current ? newest : current)
    //
    // let throughput = relevantItems.length / ((maxTime - minTime) / 1000);
    //
    // return {
    //   leadTime: averageLeadTime / TimeAdjustments.multiplicator(),
    //   throughput: throughput * TimeAdjustments.multiplicator()
    // }

    function calculateThroughput() {
      if(doneItems.length === 0) return 0;
      const minTime = doneItems.map(item => item.startTime)
        .reduce((oldest, current) => oldest < current ? oldest : current);
      const maxTime = doneItems.map(item => item.endTime)
        .reduce((newest, current) => newest > current ? newest : current);
      return doneItems.length / ((maxTime - minTime) / 1000);
    }

    function calculateLeadTime() {
      if(doneItems.length === 0) return 0;
      let averageDuration = doneItems.map(item => (item.endTime - item.startTime) / 1000)
        .reduce((sum, duration) => sum + duration, 0);
      return averageDuration / doneItems.length;
    }

    function publishStats() {
      PubSub.publish('stats.calculated', {
        throughput: calculateThroughput() * TimeAdjustments.multiplicator(),
        leadTime: calculateLeadTime() / TimeAdjustments.multiplicator(),
        workInProgress: wip
      });
    }

    PubSub.subscribe('workitem.started', (topic, item) => {
      wip++;
      publishStats();
    });

    PubSub.subscribe('workitem.finished', (topic, item) => {
      wip--;
      doneItems.push(item);
      publishStats();
    });

  }

  module.exports = {
    initialize
  };
})();
