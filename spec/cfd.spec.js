const CurrentStats = require("../src/cfd");
const {clearAllSubscriptions} = require('../src/publish-subscribe')
const BoardFactory = require("../src/boardFactory");
const {WorkList} = require("../src/worker");

describe("Cumulative Flow Diagram", () => {
  beforeAll(jest.useFakeTimers);
  beforeEach(clearAllSubscriptions);

  let stats = undefined;
  let columns = undefined;
  const backlog = () => columns[0];
  const done = () => columns[columns.length - 1];
  const add = (column, items) => items.forEach(column.add);
  const items = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]

  const init = columnNames => {
    columns = new BoardFactory().createColumns(columnNames)
    stats = CurrentStats(columns);
    stats.init();
  }

  describe("Backlog-dev-Done", () => {
    beforeEach(() => init(['dev']));

    const dev = () => columns[1];

    it('backlog = 1', function () {
      add(backlog(), [items[0]]);
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 1},
        {name: 'dev', value: 0},
        {name: 'Done', value: 0},
      ])
      expect(stats.done()).toBeFalsy()
    });

    it('backlog = 3', function () {
      add(backlog(), [items[0], items[1], items[2]]);
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 3},
        {name: 'dev', value: 0},
        {name: 'Done', value: 0},
      ])
      expect(stats.done()).toBeFalsy()
    });

    it('move 1 from backlog to dev', function () {
      add(backlog(), [items[0]]);
      backlog().move(dev(), items[0])
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 0},
        {name: 'dev', value: 1},
        {name: 'Done', value: 0},
      ])
      expect(stats.done()).toBeFalsy()
    });

    it('move 1 from dev to done', function () {
      add(backlog(), [items[0]]);
      backlog().move(dev(), items[0])
      dev().move(done(), items[0])
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 0},
        {name: 'dev', value: 0},
        {name: 'Done', value: 1},
      ])
      expect(stats.done()).toBeTruthy()
    });
  });

  describe("Backlog dev - qa Done", () => {
    beforeEach(() => init(['dev', 'qa']));

    const dev = () => columns[1];
    const queue = () => columns[2];
    const qa = () => columns[3];

    it('backlog = 1', function () {
      add(backlog(), [items[0]]);
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 1},
        {name: 'dev', value: 0},
        {name: 'qa', value: 0},
        {name: 'Done', value: 0},
      ])
      expect(stats.done()).toBeFalsy()
    });
    it('backlog to dev', function () {
      add(backlog(), [items[0]]);
      backlog().move(dev(), items[0])
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 0},
        {name: 'dev', value: 1},
        {name: 'qa', value: 0},
        {name: 'Done', value: 0},
      ])
      expect(stats.done()).toBeFalsy()
    });
    it('dev to queue', function () {
      add(backlog(), [items[0]]);
      backlog().move(dev(), items[0])
      dev().move(queue(), items[0])
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 0},
        {name: 'dev', value: 1},
        {name: 'qa', value: 0},
        {name: 'Done', value: 0},
      ])
      expect(stats.done()).toBeFalsy()
    });
    it('queue to qa', function () {
      add(backlog(), [items[0]]);
      backlog().move(dev(), items[0])
      dev().move(queue(), items[0])
      queue().move(qa(), items[0])
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 0},
        {name: 'dev', value: 0},
        {name: 'qa', value: 1},
        {name: 'Done', value: 0},
      ])
      expect(stats.done()).toBeFalsy()
    });
    it('qa to done', function () {
      add(backlog(), [items[0]]);
      backlog().move(dev(), items[0])
      dev().move(queue(), items[0])
      queue().move(qa(), items[0])
      qa().move(done(), items[0])
      jest.runAllTimers();
      expect(stats.current()).toEqual([
        {name: 'Backlog', value: 0},
        {name: 'dev', value: 0},
        {name: 'qa', value: 0},
        {name: 'Done', value: 1},
      ])
      expect(stats.done()).toBeTruthy()
    });
  });
});