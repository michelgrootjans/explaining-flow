module.exports = function (items) {
  const relevantItems = items.filter(item => item.startTime && item.endTime);
  if(relevantItems.length === 0) return {leadTime: 0, throughput: 0}

  relevantItems.forEach(item => item.duration = item.endTime - item.startTime);
  const averageLeadTime = relevantItems.map(item => (item.endTime - item.startTime)/1000)
    .reduce((sum, duration) => sum + duration, 0)/relevantItems.length;

  const minTime = relevantItems.map(item => item.startTime)
    .reduce((oldest, current) => oldest < current ? oldest : current)
  const maxTime = relevantItems.map(item => item.endTime)
    .reduce((newest, current) => newest > current ? newest : current)

  let throughput = relevantItems.length / ((maxTime - minTime)/1000);

  return {
    leadTime: averageLeadTime,
    throughput: throughput
  }
};