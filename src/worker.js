const PubSub = require('pubsub-js');
const TimeAdjustments = require('./timeAdjustments');

(function () {

  let workerCounter = 1;
  function Worker(skills = {dev: 1}) {
    let queues = {};
    let waitingToken = 0;
    let idle = true;
    const id = workerCounter++;

    let worker = {
      canDo: skill => {
        let ability = skills[skill] && skills[skill] > 0;
        // console.log({worker: id, can: skill, ability})
        return ability;
      },
      assignColumns: (inbox, inProgress, outbox) => {
        queues = {inbox, inProgress, outbox}
      },
      isIdle: () => idle,
      startWorkingOn,
      id
    };

    function calculateTimeoutFor(workItem, skill) {
      return 1000 * TimeAdjustments.multiplicator() * workItem.work[skill] / skills[skill];
    }

    function startWorkingOn(inbox, inProgress, outbox) {
      let workItem = inbox.peek();
      if(workItem) {
        idle = false;
        inbox.move(inProgress, workItem);
        let skill = inProgress.necessarySkill;
        // console.log({action: 'doing ' + skill, worker: id, item: workItem.id})
        let timeout = calculateTimeoutFor(workItem, skill);
        setTimeout(() => {
          idle = true;
          // console.log({action: 'finished ' + skill, worker: id, item: workItem.id, after: timeout})
          inProgress.move(outbox, workItem);
          PubSub.publish('worker.idle', worker);
        }, timeout)
      }
    }

    return worker
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
      necessarySkill
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
      // console.log({action: 'moving', item: item.id, from: column.id, to: to.id})
      _remove(item);
      to.add(item);
      PubSub.publish('workitem.moved', {from: column, to, item});
      return item;
    }

    return column;
  }

  module.exports = {Worker, WorkItem, WorkList};
})();