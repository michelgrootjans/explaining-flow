const TimeAdjustments = require('./timeAdjustments');
const {publish, subscribe} = require('./publish-subscribe')

function RunningWip(startTick) {
  let surface = 0;
  let latestTick = startTick;

  const delta = (now) => (now - latestTick) / 1000;
  const totalTime = (now) => (now - startTick) / 1000;

  return {
    update: (wip, now) => {
      surface += wip * delta(now);
      latestTick = now;
    },
    average: (now) => {
      const time = totalTime(now);
      if (time < 1) return 0;
      return surface / time;
    }
  };
}

function initialState(startTick) {
  return {
    wip: 0,
    runningWip: RunningWip(startTick),
    maxWip: 0,
    maxEndtime: 0,
    maxLeadtime: 0,
    minStarttime: Math.min(),
    doneItems: [],
    sumOfDurations: 0,
    timeWorked: 0
  };
}

function calculateLeadTime(items) {
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
  const leadTime = calculateLeadTime(items) / TimeAdjustments.multiplicator();
  const throughput = calculateThroughput(items) * TimeAdjustments.multiplicator();
  return {leadTime, throughput};
}

function initialize() {

  let state = undefined;

  const lastNumberOfItems = numberOfItems => state.doneItems.slice(-numberOfItems);

  function calculateAllThroughput() {
    if (state.doneItems.length === 0) return 0;
    return state.doneItems.length * 1000 / ((state.maxEndtime - state.minStarttime));
  }

  function calculateAllLeadTime() {
    if (state.doneItems.length === 0) return 0;
    return state.sumOfDurations / (state.doneItems.length * 1000);
  }

  const calculatePerformance = () => (numberOfItems) => performance(lastNumberOfItems(numberOfItems));

  function publishStats(now) {
    publish('stats.calculated', {
      throughput: calculateAllThroughput(state.doneItems) * TimeAdjustments.multiplicator(),
      leadTime: calculateAllLeadTime(state.doneItems) / TimeAdjustments.multiplicator(),
      maxLeadTime: state.maxLeadtime / TimeAdjustments.multiplicator(),
      workInProgress: state.wip,
      maxWorkInProgress: state.maxWip,
      sliding: {performance: calculatePerformance()},
      timeWorked: state.timeWorked,
      averageWip: state.runningWip.average(now)
    });
  }

  subscribe('board.ready', ({timestamp}) => {
    state = initialState(timestamp)
  });

  subscribe('workitem.started', ({timestamp}) => {
    state.runningWip.update(state.wip, timestamp);
    state.wip++;
    state.maxWip = Math.max(state.wip, state.maxWip)
    publishStats(timestamp);
  });


  function calculateDaysWorked() {
    return (state.maxEndtime - state.minStarttime) / (TimeAdjustments.multiplicator() * 1000);
  }

  subscribe('workitem.finished', (topic, {item, timestamp}) => {
    state.runningWip.update(state.wip, timestamp);
    state.wip--;
    state.maxEndtime = Math.max(state.maxEndtime, item.endTime);
    state.minStarttime = Math.min(state.minStarttime, item.startTime);
    state.maxLeadtime = Math.max(state.maxLeadtime, item.duration / 1000)
    state.timeWorked = calculateDaysWorked()
    state.sumOfDurations += (item.endTime - item.startTime)
    state.doneItems.push(item);
    publishStats(timestamp);
  });

}

module.exports = {
  initialize,
  calculateThroughput,
  performance,
};
