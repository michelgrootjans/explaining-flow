(function () {
  function Worker(inbox, inProgress, outbox) {

    const work = () => {
      if (inbox.hasWork()) {
        let work = inbox.move(inProgress);
        setTimeout(() => inProgress.move(outbox, work), work.estimate())
      }
    };
    return { work }
  }

  function WorkItem(size) {
    return {
      estimate: () => { return size }
    };
  }

  function WorkList(name) {
    let work = [];

    const push = item => {
      work.push(item);
    };

    const pull = () => {
      let item = work.pop();
      return item;
    };

    const move = (to, item = pull()) => {
      for(let i = 0; i < work.length; i++){
        if ( work[i] === item) {
          work.splice(i, 1);
        }
      }
      to.push(item);
      return item;
    };

    return {
      hasWork: () => {return work.length > 0},
      pull,
      push,
      move,
      items: () => work.map(w => w)
    };
  }

  module.exports = {Worker, WorkItem, WorkList};
})();