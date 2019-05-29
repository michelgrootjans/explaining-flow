const {WorkItem} = require('./worker');
(function () {
  function generateWorkItems(work) {
    return [...Array(100).keys()]
      .map(() => new WorkItem(work)
      );
  }

  function randomDuration(average = 1.0, spread = 0.9) {
    return average + (Math.random() - 0.5) * spread;
  }


  module.exports = {generateWorkItems, randomDuration};

})();