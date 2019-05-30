const PubSub = require('pubsub-js');
const TimeAdjustments = require('./timeAdjustments');

(function () {

  function Worker(skills = {dev: 1}) {
    let queues = {};
    let waitingToken = 0;
    let idle = true;

    let self = {
      work,
      workOn,
      canDo: (skill) => skills[skill] && skills[skill] > 0,
      assignColumns: (inbox, inProgress, outbox) => {
        queues = {inbox, inProgress, outbox}
      },
      isIdle: () => idle
    };

    function calculateTimeoutFor(workItem, skill) {
      return 1000 * TimeAdjustments.multiplicator() * workItem.work[skill] / skills[skill];
    }

    function work() {
      if (queues.inbox.hasWork()) {
        PubSub.unsubscribe(waitingToken);
        let workItem = queues.inbox.peek();
        queues.inbox.move(queues.inProgress, workItem);
        let skill = queues.inProgress.necessarySkill;
        setTimeout(() => {
          queues.inProgress.move(queues.outbox, workItem);
          PubSub.publish('worker.idle', self);
        }, calculateTimeoutFor(workItem, skill))
      } else {
        waitingToken = PubSub.subscribe('workitem.added', (topic, subject) => {
          if (subject.column.id === queues.inbox.id) work();
        })
      }
    }

    function workOn(item) {
      // if (queues.inbox.hasWork()) {
      //   PubSub.unsubscribe(waitingToken);
      //   let workItem = queues.inbox.peek();
      //   queues.inbox.move(queues.inProgress, workItem);
      //   let skill = queues.inProgress.necessarySkill;
      //   setTimeout(() => {
      //     queues.inProgress.move(queues.outbox, workItem);
      //     PubSub.publish('worker.idle', self);
      //   }, calculateTimeoutFor(workItem, skill))
      // } else {
      //   waitingToken = PubSub.subscribe('workitem.added', (topic, subject) => {
      //     if (subject.column.id === queues.inbox.id) work();
      //   })
      // }
    }

    return self
  }

  let workItemCounter = 1;

  function WorkItem(work) {
    return {
      id: workItemCounter++,
      work
    };
  }

  let workListCounter = 1;

  function WorkList(name = "dev", necessarySkill = name) {
    let work = [];
    let id = workListCounter++;
    let column = {
      hasWork: () => {
        return work.length > 0
      },
      items: () => work.map(w => w),
      peek: () => work[0],
      add,
      move,
      name,
      id,
      necessarySkill: necessarySkill
    };

    PubSub.publish('worklist.created', {id, name});

    function add(item) {
      work.push(item);
      PubSub.publish('workitem.added', {item, column});
    }

    const pull = () => {
      return work.shift();
    };

    function _remove(item) {
      for (let i = 0; i < work.length; i++) {
        if (work[i] === item) {
          work.splice(i, 1);
        }
      }
      PubSub.publish('workitem.removed', {item, column});
    }

    function move(to, item) {
      _remove(item);
      to.add(item);
      PubSub.publish('workitem.moved', {from: column, to, item});
      return item;
    }

    return column;
  }

  module.exports = {Worker, WorkItem, WorkList};
})();