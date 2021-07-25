const CurrentStats = columns => {

  const needsAStatistic = column => column.name !== '-';

  const stats = columns
    .filter(needsAStatistic)
    .map(column => ({name: column.name, value: 0}))

  const statNameFor = column => {
    if (column.name === '-')
      return column.inbox.name
    return column.name;
  };

  const statFor = column => stats.find(stat => stat.name === statNameFor(column));

  const itemAdded = (topic, {column, item}) => statFor(column).value++;
  const itemRemoved = (topic, {column, item}) => statFor(column).value--;

  const init = () => {
    // PubSub.subscribe('workitem.added', console.log)
    // PubSub.subscribe('workitem.removed', console.log)
    PubSub.subscribe('workitem.added', itemAdded)
    PubSub.subscribe('workitem.removed', itemRemoved)
  };

  return {
    init,
    current: () => stats
  }
};

module.exports = CurrentStats