const PubSub = require('pubsub-js');

(function () {
  let currentId = 1;

  function Worker(inbox, inProgress, outbox, nominalSpeed=1) {
    let waitingToken = 0;
    const work = () => {
      if (inbox.hasWork()) {
        PubSub.unsubscribe(waitingToken);
        let workItem = inbox.move(inProgress);
        setTimeout(() => {
          inProgress.move(outbox, workItem);
          work();
        }, workItem.estimate * (1/nominalSpeed))
      } else {
        waitingToken = PubSub.subscribe('workitem.added', (topic, subject) => {
          if (subject.columnId === inbox.id) work();
        })
      }
    };
    return {work}
  }


  function WorkItem(size = 1000) {
    return {
      id: currentId++,
      estimate: size,
    };
  }

  function WorkList(name="work") {
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

  function Backlog(){
    let backlog = new WorkList('backlog');
    const originalRemove = backlog.move;

    backlog.move = (to, item) => {
      item.startTime = Date.now();
      originalRemove(to, item);
    };

    return backlog;
  }

  function DoneList(){
    let backlog = new WorkList('done');
    const originalRemove = backlog.add;

    backlog.add = (item) => {
      item.endTime = Date.now();
      originalRemove(item);
      PubSub.publish('workitem.done', backlog.items())
    };

    return backlog;
  }

  module.exports = {Worker, WorkItem, WorkList, Backlog, DoneList};
})();