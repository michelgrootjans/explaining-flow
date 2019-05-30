const {WorkItem} = require('./worker');
(function () {
  function generateWorkItems(work) {
    return [...Array(100).keys()]
      .map(() => new WorkItem(work)
      );
  }

  function randomBetween(min=0, max=1) {
    return min + (Math.random() * (max-min));
  }


  module.exports = {generateWorkItems, randomBetween};

})();