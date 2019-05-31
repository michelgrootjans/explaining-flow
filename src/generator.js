const {WorkItem} = require('./worker');
(function () {
  function generateWorkItems(work, numberOfWorkItems = 200) {
    return [...Array(numberOfWorkItems).keys()]
      .map(() => new WorkItem(work())
      );
  }

  function randomBetween(min=0, max=1) {
    return min + (Math.random() * (max-min));
  }


  module.exports = {generateWorkItems, randomBetween};

})();