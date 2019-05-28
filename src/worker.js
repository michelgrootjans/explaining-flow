const PubSub = require('pubsub-js');

(function () {
  let currentId = 1;

  function Worker(inbox, inProgress, outbox) {
    let waitingToken = 0;
    const work = () => {
      if (inbox.hasWork()) {
        PubSub.unsubscribe(waitingToken);
        let workItem = inbox.move(inProgress);
        setTimeout(() => {
          inProgress.move(outbox, workItem);
          work();
        }, workItem.estimate)
      } else {
        waitingToken = PubSub.subscribe('workitem.added', (topic, subject) => {
          if (subject.columnId === inbox.id) work();
        })
      }
    };
    return {work}
  }


  function WorkItem(size) {
    return {
      id: currentId++,
      estimate: size,
    };
  }

  function WorkList(name) {
    let work = [];
    let id = currentId++;

    PubSub.publish('worklist.created', {id, name});

    const add = item => {
      work.push(item);
      PubSub.publish('workitem.added', {columnId: id, item});
    };

    const pull = () => {
      let item = work.shift();
      return item;
    };

    function _remove(item) {
      for (let i = 0; i < work.length; i++) {
        if (work[i] === item) {
          work.splice(i, 1);
        }
      }
      PubSub.publish('workitem.removed', {columnId: id, item});
    }

    const move = (to, item = pull()) => {
      _remove(item);
      to.add(item);
      PubSub.publish('workitem.moved', {from: id, to: to.id, item});
      return item;
    };

    return {
      hasWork: () => {
        return work.length > 0
      },
      items: () => work.map(w => w),
      add,
      move,
      name,
      id
    };
  }

  module.exports = {Worker, WorkItem, WorkList};
})();