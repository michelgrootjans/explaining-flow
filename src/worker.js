const PubSub = require('pubsub-js');

(function () {
  let currentId = 1;

  function Worker(inbox, inProgress, outbox, nominalSpeed = 1) {
    let queues = {
      inbox: inbox,
      inProgress: inProgress,
      outbox: outbox
    };
    let skills = {
      ux: nominalSpeed,
      dev: nominalSpeed,
      qa: nominalSpeed
    }
    let waitingToken = 0;
    const work = () => {
      if (queues.inbox.hasWork()) {
        PubSub.unsubscribe(waitingToken);
        let workItem = queues.inbox.peek();
        queues.inbox.move(queues.inProgress, workItem);
        setTimeout(() => {
          queues.inProgress.move(queues.outbox, workItem);
          work();
        }, workItem.work['dev'] * (1 / nominalSpeed))
      } else {
        waitingToken = PubSub.subscribe('workitem.added', (topic, subject) => {
          if (subject.columnId === queues.inbox.id) work();
        })
      }
    };
    return {work}
  }

  let workItemCounter = 1;

  function WorkItem(size = 1000) {
    work = {
      ux: size,
      dev: size,
      review: size,
      qa: size
    };
    return {
      id: workItemCounter++,
      estimate: size,
      work: work
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
      return work.shift();
    };

    function _remove(item) {
      for (let i = 0; i < work.length; i++) {
        if (work[i] === item) {
          work.splice(i, 1);
        }
      }
      PubSub.publish('workitem.removed', {columnId: id, item});
    }

    const move = (to, item) => {
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
      peek: () => work[0],
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