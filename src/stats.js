module.exports = function (items) {
  const relevantItems = items.filter(item => item.startTime && item.endTime);
  if(relevantItems.length === 0) return {leadTime: 0, throughput: 0}

  relevantItems.forEach(item => item.duration = item.endTime - item.startTime);
  const averageLeadTime = relevantItems.map(item => (item.endTime - item.startTime)/1000)
    .reduce((sum, duration) => sum + duration, 0)/relevantItems.length;

  return {
    leadTime: averageLeadTime,
    throughput: 1
  }
};