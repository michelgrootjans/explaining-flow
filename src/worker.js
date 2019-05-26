const PubSub = require('pubsub-js');

(function () {
  function Worker(inbox, inProgress, outbox) {

    const work = () => {
      if (inbox.hasWork()) {
        let work = inbox.pull();
        outbox.push(work);
        PubSub.publish('work-outbox', {
          from: 1,
          to: 2,
          work: work
        });
      }
    };
    return {
      work: work
    }
  }

  function WorkItem() {
    return {};
  }

  function WorkList() {
    let work = [];

    return {
      hasWork: () => {return work.length > 0},
      pull: () => {return work.pop()},
      push: item => work.push(item),
      items: () => work.map(w => w)
    };
  }

  module.exports = {Worker, WorkItem, WorkList};
})();