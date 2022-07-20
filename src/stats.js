const TimeAdjustments = require('./timeAdjustments');
const PubSub = require('pubsub-js');

function RunningWip() {
  const startTick = Date.now();

  let surface = 0;
  let latestTick = Date.now();

  const delta = () => (Date.now() - latestTick) / 1000;
  const totalTime = () => (Date.now() - startTick) / 1000;

  return {
    update: (wip) => {
      surface += wip * delta();
      latestTick = Date.now();
    },
    average: () => {
      const time = totalTime();
      if (time < 1) return 0;
      return surface / time;
    }
  };
}

function initialState() {
  return {
    wip: 0,
    runningWip: RunningWip(),
    maxWip: 0,
    maxEndtime: 0,
    maxCycletime: 0,
    minStarttime: Math.min(),
    doneItems: [],
    sumOfDurations: 0,
    timeWorked: 0
  };
}

function calculateCycleTime(items) {
  if (items.length === 0) return 0;
  let sumOfDurations = items.map(item => (item.endTime - item.startTime) / 1000)
    .reduce((sum, duration) => sum + duration, 0);
  return sumOfDurations / items.length;
}

function calculateThroughput(items) {
  if (items.length === 0) return 0;
  if (items.length === 1) {
    const [item] = items;
    const elapsedTime = item.endTime - item.startTime;
    return 1000 * items.length / elapsedTime;
  }

  const minTime = items.map(item => item.endTime)
    .reduce((oldest, current) => oldest < current ? oldest : current);
  const maxTime = items.map(item => item.endTime)
    .reduce((newest, current) => newest > current ? newest : current);
  let elapsedTime = maxTime - minTime;

  if (elapsedTime < 100) {
    const minStartTime = items.map(item => item.startTime)
      .reduce((oldest, current) => oldest < current ? oldest : current);
    elapsedTime = maxTime - minStartTime
    return 1000 * items.length / elapsedTime;
  }

  return 1000 * (items.length - 1) / elapsedTime;
}

function performance(items) {
  const cycleTime = calculateCycleTime(items) / TimeAdjustments.multiplicator();
  const throughput = calculateThroughput(items) * TimeAdjustments.multiplicator();
  return {cycleTime, throughput};
}

function initialize() {

  let state = undefined;

  const lastNumberOfItems = numberOfItems => state.doneItems.slice(-numberOfItems);

  function calculateAllThroughput() {
    if (state.doneItems.length === 0) return 0;
    return state.doneItems.length * 1000 / ((state.maxEndtime - state.minStarttime));
  }

  function calculateAllCycleTime() {
    if (state.doneItems.length === 0) return 0;
    return state.sumOfDurations / (state.doneItems.length * 1000);
  }

  function calculatePerformance() {
    return (secondsToLookBack) => performance(lastNumberOfItems(secondsToLookBack))
  }

  function throughputForLast(numberOfItems) {
    return calculateThroughput(lastNumberOfItems(numberOfItems)) * TimeAdjustments.multiplicator();
  }

  function publishStats() {
    PubSub.publish('stats.calculated', {
      throughput: calculateAllThroughput(state.doneItems) * TimeAdjustments.multiplicator(),
      cycleTime: calculateAllCycleTime(state.doneItems) / TimeAdjustments.multiplicator(),
      maxCycleTime: state.maxCycletime / TimeAdjustments.multiplicator(),
      workInProgress: state.wip,
      maxWorkInProgress: state.maxWip,
      sliding: {performance: calculatePerformance()},
      timeWorked: state.timeWorked,
      averageWip: state.runningWip.average()
    });
  }

  PubSub.subscribe('board.ready', () => {
    state = initialState()
  });

  PubSub.subscribe('workitem.started', () => {
    state.runningWip.update(state.wip);
    state.wip++;
    state.maxWip = Math.max(state.wip, state.maxWip)
    publishStats();
  });


  function calculateDaysWorked() {
    return (state.maxEndtime - state.minStarttime) / (TimeAdjustments.multiplicator() * 1000);
  }

  PubSub.subscribe('workitem.finished', (topic, item) => {
    state.runningWip.update(state.wip);
    state.wip--;
    state.maxEndtime = Math.max(state.maxEndtime, item.endTime);
    state.minStarttime = Math.min(state.minStarttime, item.startTime);
    state.maxCycletime = Math.max(state.maxCycletime, item.duration / 1000)
    state.timeWorked = calculateDaysWorked()
    state.sumOfDurations += (item.endTime - item.startTime)
    state.doneItems.push(item);
    publishStats();
  });

}

module.exports = {
  initialize,
  calculateThroughput,
  performance,
};
