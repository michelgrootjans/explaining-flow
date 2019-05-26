const {Worker, WorkItem, WorkList} = require('../src/worker');

describe('a worker', () => {
  beforeEach(() => {
    inbox = new WorkList();
    inProgress = new WorkList();
    outbox = new WorkList();
    worker = new Worker(inbox, inProgress, outbox);
  });

  it('can be idle', () => {
    worker.work();
    expect(inbox.items()).toEqual([]);
    expect(inProgress.items()).toEqual([]);
    expect(outbox.items()).toEqual([]);
  });

  it('finish one item', () => {
    let workItem = new WorkItem(1);
    inbox.push(workItem);
    worker.work();

    expect(inbox.items()).toEqual([]);
    expect(inProgress.items()).toEqual([]);
    expect(outbox.items()).toEqual([workItem]);
  });

  it('working on one item', () => {
    let workItem = new WorkItem(2);
    inbox.push(workItem);
    worker.work();

    expect(inbox.items()).toEqual([]);
    expect(inProgress.items()).toEqual([workItem]);
    expect(outbox.items()).toEqual([]);
  });

  it('finishing a longer item', () => {
    let workItem = new WorkItem(2);
    inbox.push(workItem);
    worker.work();
    worker.work();

    expect(inbox.items()).toEqual([]);
    expect(inProgress.items()).toEqual([]);
    expect(outbox.items()).toEqual([workItem]);
  });
});
