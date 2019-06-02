const {Worker, WorkItem, WorkList} = require('../src/worker');
const Board = require('../src/board');
const PubSub = require('pubsub-js');

describe('a worker', () => {
  beforeEach(PubSub.clearAllSubscriptions);
  beforeEach(jest.useFakeTimers);
  afterEach(jest.runAllTimers);

  beforeEach(() => {
    now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    board = new Board(
      new WorkList('dev')
    );
  });

  describe('without tasks', () => {
    it('doesnt crash', () => {
      board.addWorkers(new Worker({dev: 1}));
      jest.runAllTimers();
      expect(board.items()).toEqual([[], [], []]);
    });
  });

  describe('with one task', () => {
    beforeEach(() => {
      board.addWorkers(new Worker({dev: 1}));
      workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
    });
    it('works on the item', () => {
      jest.advanceTimersByTime(999);
      expect(board.items()).toEqual([[], [workItem], []]);
      expect(workItem.startTime).toBe(now);
      expect(workItem.endTime).toBeUndefined();
    });

    it('finishes the item', () => {
      jest.advanceTimersByTime(1000);
      expect(board.items()).toEqual([[], [], [workItem]]);
      expect(workItem.startTime).toBe(now);
      expect(workItem.endTime).toBe(now);
    });
  });


  describe('works on an item added after simulation started', () => {
    it('works', () => {
      board.addWorkers(new Worker({dev: 1}));
      let workItem = new WorkItem({dev: 1});
      workItem.foo = 'bar';
      board.addWorkItems(workItem);
      jest.advanceTimersByTime(999);
      expect(board.items()).toEqual([[], [workItem], []]);
    });
  });


  describe('with two tasks', () => {
    beforeEach(() => {
      board.addWorkers(new Worker({dev: 1}));
      workItem1 = new WorkItem({dev: 1});
      workItem1.name = "one"
      workItem2 = new WorkItem({dev: 1});
      workItem2.name = "two"
      board.addWorkItems(workItem1, workItem2);
      jest.advanceTimersByTime(0);
    });
    it('works on the first item', () => {
      jest.advanceTimersByTime(999);
      expect(board.items()[0]).toContain(workItem2);
      expect(board.items()[1]).toContain(workItem1);
      expect(board.items()[2]).toEqual([]);
      expect(workItem1.startTime).toBe(now);
      expect(workItem1.endTime).toBeUndefined();
      expect(workItem2.startTime).toBeUndefined();
      expect(workItem2.endTime).toBeUndefined();
    });

    it('finishes the first item and starts on the second', () => {
      jest.advanceTimersByTime(1000);
      expect(board.items()[0]).toEqual([]);
      expect(board.items()[1]).toContain(workItem2);
      expect(board.items()[2]).toContain(workItem1);
      expect(workItem1.startTime).toBe(now);
      expect(workItem1.endTime).toBe(now);
      expect(workItem2.startTime).toBe(now);
      expect(workItem2.endTime).toBeUndefined();
    });

    it('almost finishes the second', () => {
      jest.advanceTimersByTime(1999);
      expect(board.items()[0]).toEqual([]);
      expect(board.items()[1]).toContain(workItem2);
      expect(board.items()[2]).toContain(workItem1);
      expect(workItem1.startTime).toBe(now);
      expect(workItem1.endTime).toBe(now);
      expect(workItem2.startTime).toBe(now);
      expect(workItem2.endTime).toBeUndefined();
    });

    it('finishes the second item', () => {
      jest.advanceTimersByTime(2000);
      expect(board.items()[0]).toEqual([]);
      expect(board.items()[1]).toEqual([]);
      expect(board.items()[2]).toContain(workItem1, workItem2);
      expect(workItem1.startTime).toBe(now);
      expect(workItem1.endTime).toBe(now);
      expect(workItem2.startTime).toBe(now);
      expect(workItem2.endTime).toBe(now);
    });
  });
});

describe('workers work at their own speed', () => {
  beforeEach(PubSub.clearAllSubscriptions);
  beforeEach(jest.useFakeTimers);
  afterEach(jest.runAllTimers);

  beforeEach(() => {
    board = new Board(
      new WorkList('dev')
    );
  });

  describe('nominal worker', function () {
    beforeEach(() => {
      workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
      board.addWorkers(new Worker({dev: 1}));
    });
    it('starts instantly', () => {
      jest.advanceTimersByTime(0);
      expect(board.items()).toEqual([[], [workItem], []]);
    });
    it('is still busy after almost 1 hour', () => {
      jest.advanceTimersByTime(999);
      expect(board.items()).toEqual([[], [workItem], []]);
    });
    it('finishes after 1 hour', () => {
      jest.advanceTimersByTime(1000);
      expect(board.items()).toEqual([
        [], [], [workItem]]);
    })
  });
  describe('a half-speed worker', function () {
    beforeEach(() => {
      workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
      board.addWorkers(new Worker({dev: 0.5}));
    });
    it('starts instantly', () => {
      jest.advanceTimersByTime(0);
      expect(board.items()).toEqual([[], [workItem], []]);
    });
    it('is still busy at almost 2 hours', () => {
      jest.advanceTimersByTime(1999);
      expect(board.items()).toEqual([[], [workItem], []]);
    });
    it('finishes after 2 hours', () => {
      jest.advanceTimersByTime(2000);
      expect(board.items()).toEqual([[], [], [workItem]]);
    })
  });
});

describe('a typical workflow', () => {
  beforeEach(PubSub.clearAllSubscriptions);
  beforeEach(jest.useFakeTimers);
  afterEach(jest.runAllTimers);

  var board = undefined;
  var workItem1 = undefined;
  var workItem2 = undefined;
  beforeEach(() => {
    board = new Board(
      new WorkList('dev'),
      new WorkList('qa')
    );
    board.addWorkers(
      new Worker({dev: 1}),
      new Worker({qa: 1}),
    );
    workItem1 = new WorkItem({dev: 1, qa: 2});
    workItem2 = new WorkItem({dev: 2, qa: 1});
    board.addWorkItems(workItem1, workItem2);
    jest.advanceTimersByTime(0);
  });
  it('starts normally', () => {
    expect(board.items()[0]).toEqual([workItem2]);
    expect(board.items()[1]).toEqual([workItem1]);
    expect(board.items()[2]).toEqual([]);
    expect(board.items()[3]).toEqual([]);
    expect(board.items()[4]).toEqual([]);
  });
  it('after 1 tick', () => {
    jest.advanceTimersByTime(1000);
    expect(board.items()[0]).toEqual([]);
    expect(board.items()[1]).toContain(workItem2);
    expect(board.items()[2]).toEqual([]);
    expect(board.items()[3]).toContain(workItem1);
    expect(board.items()[4]).toEqual([]);
  });
  it('after 2 ticks', () => {
    jest.advanceTimersByTime(2000);
    expect(board.items()).toEqual([[], [workItem2], [], [workItem1], []]);
  });
  it('after 3 ticks', () => {
    jest.advanceTimersByTime(3000);
    expect(board.items()).toEqual([[], [], [], [workItem2], [workItem1]]);
  });
  it('after 4 ticks', () => {
    jest.advanceTimersByTime(4000);
    expect(board.items()).toEqual([[], [], [], [], [workItem1, workItem2]]);
  });
});

