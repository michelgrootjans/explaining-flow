const {Worker, WorkItem, WorkList, Backlog, DoneList} = require('../src/worker');

describe('columns', () => {
  it('move', () => {
    const inbox = new WorkList('inbox');
    const outbox = new WorkList('outbox');
    const workItem = new WorkItem(1000);

    inbox.add(workItem);
    inbox.move(outbox);
    expect(workItem.startTime).toBeUndefined();
    expect(workItem.endTime).toBeUndefined();
  });
  it('start marks a story', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementationOnce(() => now);
    const inbox = new Backlog();
    const outbox = new WorkList('outbox');
    const workItem = new WorkItem(1000);

    inbox.add(workItem);
    inbox.move(outbox, workItem);

    expect(workItem.startTime).toEqual(now);
    expect(workItem.endTime).toBeUndefined();
  });
  it('done marks a story', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementationOnce(() => now);
    const inbox = new WorkList();
    const outbox = new DoneList();
    const workItem = new WorkItem(1000);

    inbox.add(workItem);
    inbox.move(outbox, workItem);

    expect(workItem.startTime).toBeUndefined();
    expect(workItem.endTime).toEqual(now);
  });
});
