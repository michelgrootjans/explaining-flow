const PubSub = require('pubsub-js');

const CurrentStats = (columns: any[]) => {

  const needsAStatistic = (column: any) => column.name !== '-';

  const stats = columns
    .filter(needsAStatistic)
    .map(column => ({name: column.name, value: 0}))

  const statNameFor = (column: any) => {
    if (column.name === '-')
      return column.inbox.name
    return column.name;
  };

  const statFor = (column: any) => stats.find(stat => stat.name === statNameFor(column));

  const itemAdded = (topic: string, {column, item}: any) => statFor(column)!.value++;
  const itemRemoved = (topic: string, {column, item}: any) => statFor(column)!.value--;

  const init = () => {
    PubSub.subscribe('workitem.added', itemAdded)
    PubSub.subscribe('workitem.removed', itemRemoved)
  };

  const done = () => {
    const allStatsButDone = stats.slice(0, -1);
    const notDoneCount = allStatsButDone.reduce((sum, stats) => sum + stats.value, 0);
    return notDoneCount === 0
  };

  return {
    init,
    current: () => stats,
    done
  }
};

module.exports = CurrentStats;

export {};
