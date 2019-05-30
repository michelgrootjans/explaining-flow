const {Worker, WorkItem, WorkList} = require('../src/worker');
const Board = require('../src/board');

describe('a worker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    board = new Board(
      new WorkList('in'),
      new WorkList('dev'),
      new WorkList('out')
    );
  });

  describe('without tasks', () => {
    it('doesnt crash', () => {
      board.addWorkers(new Worker({dev: 1}));
      board.runSimulation();
      jest.runAllTimers();
      expect(board.items()).toEqual([[], [], []]);
    });
  });

  describe('with one task', () => {
    beforeEach(() => {
      workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
      board.addWorkers(new Worker({dev: 1}));
      board.runSimulation();
    });
    it('works on the item', () => {
      jest.advanceTimersByTime(999);
      expect(board.items()).toEqual([[], [workItem], []]);
      expect(workItem.startTime).toBe(now);
      expect(workItem.endTime).toBeUndefined();
    });

    it('finished the item', () => {
      jest.advanceTimersByTime(1000);
      expect(board.items()).toEqual([[], [], [workItem]]);
      expect(workItem.startTime).toBe(now);
      expect(workItem.endTime).toBe(now);
    });
  });

  describe('with two tasks', () => {
    beforeEach(() => {
      workItem1 = new WorkItem({dev: 1});
      workItem2 = new WorkItem({dev: 1});
      board.addWorkItems(workItem1, workItem2);
      board.addWorkers(new Worker({dev: 1}));
      board.runSimulation();
    });
    it('works on the first item', () => {
      jest.advanceTimersByTime(999);
      expect(board.items()).toEqual([[workItem2], [workItem1], []]);
      expect(workItem1.startTime).toBe(now);
      expect(workItem1.endTime).toBeUndefined();
      expect(workItem2.startTime).toBeUndefined();
      expect(workItem2.endTime).toBeUndefined();
    });

    it('finished the first item and starts on the second', () => {
      jest.advanceTimersByTime(1000);
      expect(board.items()).toEqual([[], [workItem2], [workItem1]]);
      expect(workItem1.startTime).toBe(now);
      expect(workItem1.endTime).toBe(now);
      expect(workItem2.startTime).toBe(now);
      expect(workItem2.endTime).toBeUndefined();
    });

    it('almost finishes the second', () => {
      jest.advanceTimersByTime(1999);
      expect(board.items()).toEqual([[], [workItem2], [workItem1]]);
      expect(workItem1.startTime).toBe(now);
      expect(workItem1.endTime).toBe(now);
      expect(workItem2.startTime).toBe(now);
      expect(workItem2.endTime).toBeUndefined();
    });

    it('finishes the second item', () => {
      jest.advanceTimersByTime(2000);
      expect(board.items()).toEqual([[], [], [workItem1, workItem2]]);
      expect(workItem1.startTime).toBe(now);
      expect(workItem1.endTime).toBe(now);
      expect(workItem2.startTime).toBe(now);
      expect(workItem2.endTime).toBe(now);
    });
  });
});

describe('workers work at their own speed', () => {
  beforeEach(() => {
    board = new Board(
      new WorkList('in'),
      new WorkList('dev'),
      new WorkList('out')
    );
  });

  describe('nominal worker', function () {
    beforeEach(() => {
      workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
      board.addWorkers(new Worker({dev: 1}));
      board.runSimulation();
    });
    it('starts instantly', () => {
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
      board.runSimulation();
    });
    it('starts instantly', () => {
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

