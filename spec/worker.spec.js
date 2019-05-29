const {Worker, WorkItem, WorkList} = require('../src/worker');

function Board(...columns) {
  let addWorkers = (...workers) => {
    workers.forEach(worker => worker.work());
  };
  return {
    addWorkers: addWorkers
  }
}

describe('a worker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    inbox = new WorkList('in');
    inProgress = new WorkList('dev');
    outbox = new WorkList('out');
    board = new Board(inbox, inProgress, outbox);
    worker = new Worker(inbox, inProgress, outbox);
  });

  describe('without tasks', () => {
    it('doesnt crash', () => {
      board.addWorkers(worker);
      jest.runAllTimers();
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([]);
      expect(outbox.items()).toEqual([]);
    });
  });

  describe('with one task', () => {
    beforeEach(() => {
      workItem = new WorkItem(1000);
      inbox.add(workItem);
      board.addWorkers(worker);
    });
    it('works on the item', () => {
      jest.advanceTimersByTime(999);

      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem]);
      expect(outbox.items()).toEqual([]);
    });

    it('finished the item', () => {
      jest.advanceTimersByTime(1000);

      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([]);
      expect(outbox.items()).toEqual([workItem]);
    });
  });

  describe('with two tasks', () => {
    beforeEach(() => {
      workItem1 = new WorkItem(1000);
      workItem2 = new WorkItem(500);
      board.addWorkers(worker);
      inbox.add(workItem1);
      inbox.add(workItem2);
    });
    it('works on the first item', () => {
      jest.advanceTimersByTime(999);

      expect(inbox.items()).toEqual([workItem2]);
      expect(inProgress.items()).toEqual([workItem1]);
      expect(outbox.items()).toEqual([]);
    });

    it('finished the first item and starts on the second', () => {
      jest.advanceTimersByTime(1000);

      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem2]);
      expect(outbox.items()).toEqual([workItem1]);
    });

    it('almost finishes the second', () => {
      jest.advanceTimersByTime(1499);

      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem2]);
      expect(outbox.items()).toEqual([workItem1]);
    });

    it('finishes the second item', () => {
      jest.advanceTimersByTime(1500);

      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([]);
      expect(outbox.items()).toEqual([workItem1, workItem2]);
    });
  });
});

describe('workers work at their own speed', () => {
  describe('nominal worker', function () {
    beforeEach(() => {
      inbox = new WorkList('Inbox');
      inProgress = new WorkList('dev');
      outbox = new WorkList('Outbox');
      workItem = new WorkItem(1000);
      inbox.add(workItem);
      new Worker(inbox, inProgress, outbox, 1).work();
    });
    it('starts instantly', () => {
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem]);
      expect(outbox.items()).toEqual([]);
    });
    it('is still busy after 999', () => {
      jest.advanceTimersByTime(999);
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem]);
      expect(outbox.items()).toEqual([]);
    });
    it('finishes after 1000', () => {
      jest.advanceTimersByTime(1000);
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([]);
      expect(outbox.items()).toEqual([workItem]);
    })
  });
  describe('slow worker', function () {
    beforeEach(() => {
      inbox = new WorkList('Inbox');
      inProgress = new WorkList('dev');
      outbox = new WorkList('Outbox');
      workItem = new WorkItem(1000);
      inbox.add(workItem);
      new Worker(inbox, inProgress, outbox, 0.5).work();
    });
    it('starts instantly', () => {
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem]);
      expect(outbox.items()).toEqual([]);
    });
    it('is still busy after 999', () => {
      jest.advanceTimersByTime(1999);
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem]);
      expect(outbox.items()).toEqual([]);
    });
    it('finishes after 1000', () => {
      jest.advanceTimersByTime(2000);
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([]);
      expect(outbox.items()).toEqual([workItem]);
    })
  });

});

