const PubSub = require('pubsub-js');

(function () {
  function LimitBoardWip(limit=1) {
    let wip = 0;

    PubSub.publish('board.allowNewWork', {wip, limit});

    PubSub.subscribe('workitem.started', () => {
      wip++;
      if(wip >= limit) PubSub.publish('board.denyNewWork', {wip, limit});
    });
    PubSub.subscribe('workitem.finished', () => {
      wip--;
      if(wip < limit) PubSub.publish('board.allowNewWork', {wip, limit});
    });

    return {};
  }

  module.exports = {LimitBoardWip}
})();