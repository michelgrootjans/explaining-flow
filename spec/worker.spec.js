const {Worker, WorkItem, WorkList} = require('../src/worker');

describe('a worker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    inbox = new WorkList('Inbox');
    inProgress = new WorkList('In Progress');
    outbox = new WorkList('Outbox');
    worker = new Worker(inbox, inProgress, outbox);
  });

  it('can be idle', () => {
    worker.work();
    jest.runAllTimers();
    expect(inbox.items()).toEqual([]);
    expect(inProgress.items()).toEqual([]);
    expect(outbox.items()).toEqual([]);
  });

  it('working on one item', () => {
    let workItem = new WorkItem(1000);
    inbox.push(workItem);
    worker.work();

    jest.advanceTimersByTime(500);
    expect(inbox.items()).toEqual([]);
    expect(inProgress.items()).toEqual([workItem]);
    expect(outbox.items()).toEqual([]);
  });

  it('finish one item', () => {
    let workItem = new WorkItem(1000);
    inbox.push(workItem);
    worker.work();

    jest.advanceTimersByTime(1000);
    expect(inbox.items()).toEqual([]);
    expect(inProgress.items()).toEqual([]);
    expect(outbox.items()).toEqual([workItem]);
  });
});
