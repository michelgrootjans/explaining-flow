const PubSub = require('pubsub-js');

(function () {
  function Worker(inbox, inProgress, outbox) {

    const work = () => {
      if (inProgress.hasWork()) {
        let work = inProgress.pull();
        work.increment();
        if(work.isDone()) {
          outbox.push(work)
        } else {
          inProgress.push(work);
        }
      }

      else if (inbox.hasWork()) {
        let work = inbox.pull();
        work.increment();
        if(work.isDone()) {
          outbox.push(work)
        } else {
          inProgress.push(work);
        }
      }
    };
    return {
      work: work
    }
  }

  function WorkItem(size) {
    let workToDo = size;
    return {
      increment: () => workToDo -= 1,
      isDone: () => { return workToDo <= 0 }
    };
  }

  function WorkList() {
    let work = [];

    const push = item => {
      work.push(item);
      PubSub.publish('column.work-added', {column: this, work: item});
    };

    const pull = () => {
      let item = work.pop();
      PubSub.publish('column.work-removed', {column: this, work: item});
      return item;
    };

    return {
      hasWork: () => {return work.length > 0},
      pull: pull,
      push: push,
      items: () => work.map(w => w)
    };
  }

  module.exports = {Worker, WorkItem, WorkList};
})();