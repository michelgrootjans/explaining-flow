const {Worker, WorkItem, WorkList} = require('../src/worker');

describe('a worker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    inbox = new WorkList('Inbox');
    inProgress = new WorkList('In Progress');
    outbox = new WorkList('Outbox');
    worker = new Worker(inbox, inProgress, outbox);
  });

  describe('without tasks', () => {
    it('doesnt crash', () => {
      worker.work();
      jest.runAllTimers();
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([]);
      expect(outbox.items()).toEqual([]);
    });
  });

  describe('with one task', () => {
    it('works on the item', () => {
      let workItem = new WorkItem(1000);
      worker.work();
      inbox.add(workItem);

      jest.advanceTimersByTime(500);
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem]);
      expect(outbox.items()).toEqual([]);
    });

    it('finished the item', () => {
      let workItem = new WorkItem(1000);
      worker.work();
      inbox.add(workItem);

      jest.advanceTimersByTime(1000);
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([]);
      expect(outbox.items()).toEqual([workItem]);
    });

  });

  describe('with two tasks', () => {
    it('works on the first item', () => {
      let workItem1 = new WorkItem(1000);
      let workItem2 = new WorkItem(500);
      inbox.add(workItem1);
      inbox.add(workItem2);
      worker.work();

      jest.advanceTimersByTime(500);
      expect(inbox.items()).toEqual([workItem2]);
      expect(inProgress.items()).toEqual([workItem1]);
      expect(outbox.items()).toEqual([]);
    });

    it('finished the first item and starts on the second', () => {
      let workItem1 = new WorkItem(1000);
      let workItem2 = new WorkItem(500);
      inbox.add(workItem1);
      inbox.add(workItem2);
      worker.work();

      jest.advanceTimersByTime(1000);
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([workItem2]);
      expect(outbox.items()).toEqual([workItem1]);
    });

    it('finished the second item', () => {
      let workItem1 = new WorkItem(1000);
      let workItem2 = new WorkItem(500);
      inbox.add(workItem1);
      inbox.add(workItem2);
      worker.work();

      jest.advanceTimersByTime(1500);
      expect(inbox.items()).toEqual([]);
      expect(inProgress.items()).toEqual([]);
      expect(outbox.items()).toEqual([workItem1, workItem2]);
    });

  });
});
