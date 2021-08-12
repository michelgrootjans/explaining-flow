const PubSub = require('pubsub-js');
const Board = require('../src/board');
const {WorkList, Worker, WorkItem} = require('../src/worker');
const {LimitBoardWip} = require('../src/strategies');

describe('limiting overall wip', () => {

  beforeEach(PubSub.clearAllSubscriptions);
  beforeEach(jest.useFakeTimers);
  afterEach(jest.runAllTimers);

  describe('on a project with dev-qa', () => {
    let board = undefined;
    let item1 = undefined;
    let item2 = undefined;

    beforeEach(() => {
      board = new Board(['dev', 'qa']);
      new LimitBoardWip().initialize(1);
      board.addWorkers(new Worker({dev: 1}), new Worker({qa: 1}));

      item1 = new WorkItem({dev: 1, qa: 1});
      item2 = new WorkItem({dev: 1, qa: 1});

      board.addWorkItems(item1, item2);
      jest.advanceTimersByTime(0);
    });

    it('should do (dev on item 1)', () => {
      expect(board.items()[0]).toContain(item2);
      expect(board.items()[1]).toContain(item1);
      expect(board.items()[2]).toEqual([]);
      expect(board.items()[3]).toEqual([]);
      expect(board.items()[4]).toEqual([]);
    });

    it('should do (qa on item 1), not (dev on item 2)', () => {
      jest.advanceTimersByTime(1000);
      expect(board.items()[0]).toContain(item2);
      expect(board.items()[1]).toEqual([]);
      expect(board.items()[2]).toEqual([]);
      expect(board.items()[3]).toContain(item1);
      expect(board.items()[4]).toEqual([]);
    });

    it('should do (dev on item 2) after (qa on item 1)', () => {
      jest.advanceTimersByTime(2000);
      expect(board.items()[0]).toEqual([]);
      expect(board.items()[1]).toContain(item2);
      expect(board.items()[2]).toEqual([]);
      expect(board.items()[3]).toEqual([]);
      expect(board.items()[4]).toContain(item1);
    });

  });
});