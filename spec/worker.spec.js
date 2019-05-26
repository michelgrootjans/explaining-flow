const Worker = require('../src/worker');

function WorkItem() {
  return {};
}

describe('a worker', () => {
  beforeEach(() => {
    worker = new Worker();
  });

  it('can be idle', () => {
    let inbox = [];
    let outbox = [];
    worker.work(inbox, outbox);
    expect(inbox).toEqual([]);
    expect(outbox).toEqual([]);
  });

  it('picks one item', () => {
    let inbox = [new WorkItem()];
    let outbox = [];
    worker.work(inbox, outbox);

    expect(inbox).toEqual([]);
    expect(outbox).toEqual([new WorkItem()]);
  });

  it('picks one item at the time', () => {
    let inbox = [new WorkItem(), new WorkItem()];
    let outbox = [];
    worker.work(inbox, outbox);

    expect(inbox).toEqual([new WorkItem()]);
    expect(outbox).toEqual([new WorkItem()]);
  });

  it('picks one item after the other', () => {
    let inbox = [new WorkItem(), new WorkItem()];
    let outbox = [];
    worker.work(inbox, outbox);
    worker.work(inbox, outbox);

    expect(inbox).toEqual([]);
    expect(outbox).toEqual([new WorkItem(), new WorkItem()]);
  });
});
