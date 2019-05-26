(function () {
  function Worker() {

    const work = (inbox, outbox) => {
      if(inbox.length > 0)
        outbox.push(inbox.pop());
    };
    return {
      work: work
    }
  }

  module.exports = Worker;
})();