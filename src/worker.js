const PubSub = require('pubsub-js');

(function () {
  let currentId = 1;

  function Worker(inbox, inProgress, outbox) {
    const work = () => {
      if (inbox.hasWork()) {
        let workItem = inbox.move(inProgress);
        setTimeout(() => {
          inProgress.move(outbox, workItem);
          work();
        }, workItem.estimate)
      }
    };
    return {work}
  }


  function WorkItem(size) {
    return {
      estimate: size,
    };
  }

  function WorkList(name) {
    let work = [];
    let id = currentId++;

    PubSub.publish('worklist.created', {id, name});

    const push = item => {
      work.push(item);
    };

    const pull = () => {
      let item = work.shift();
      return item;
    };

    const move = (to, item = pull()) => {
      for (let i = 0; i < work.length; i++) {
        if (work[i] === item) {
          work.splice(i, 1);
        }
      }
      to.add(item);
      return item;
    };

    return {
      hasWork: () => {
        return work.length > 0
      },
      add: push,
      move,
      items: () => work.map(w => w),
      name,
      id
    };
  }

  module.exports = {Worker, WorkItem, WorkList};
})();