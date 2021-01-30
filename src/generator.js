const {WorkItem} = require('./worker');
(function () {
  function generateWorkItems(work, numberOfWorkItems = 100) {
    return [...Array(numberOfWorkItems).keys()]
      .map(() => new WorkItem(work())
      );
  }

  function randomBetween(min=0, max=1) {
    return min + (Math.random() * (max-min));
  }

  function average(value) {
    let distance = value * 0.8;
    return randomBetween(value - distance, value + distance);
  }

  module.exports = {generateWorkItems, randomBetween, average};

})();