const PubSub = require('pubsub-js');
const $ = require('jquery');
const animation = require('../src/animation');

const {Worker, WorkItem} = require('../src/worker');
const Board = require('../src/board');

describe('animation', () => {
  beforeAll(() => {
    $.fx.off = true;
    jest.useFakeTimers();
    PubSub.clearAllSubscriptions();
    animation.initialize("#stats-container");
  });

  describe('a simple dashboard', () => {
    let board = undefined;
    beforeEach(() => {
      document.body.innerHTML = '<ul id="board"></ul>';
      board = new Board(['dev']);
    });

    describe('with only dev', () => {
      it('should have a backlog column', () => {
        jest.runAllTimers();

        let $backlog = $('#board li:nth-child(1)');
        expect($backlog.attr('class')).toBe('column queue');
        expect($backlog.text()).toBe('Backlog');
        expect($backlog.find('ul').attr('class')).toBe('cards');
      });

      it('should have a dev column', () => {
        jest.runAllTimers();

        let $dev = $('#board li:nth-child(2)');
        expect($dev.attr('class')).toBe('column work');
        expect($dev.text()).toBe('dev');
        expect($dev.find('ul').attr('class')).toBe('cards');
      });

      it('should have a done column', () => {
        jest.runAllTimers();

        let $done = $('#board li:nth-child(3)');
        expect($done.attr('class')).toBe('column queue');
        expect($done.text()).toBe('Done');
        expect($done.find('ul').attr('class')).toBe('cards');
      });
    });

    it('shows work items', () => {
      let workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
      jest.advanceTimersByTime(0);

      const $card = $('#board li:nth-child(1) .cards li');
      expect($card.attr('data-card-id')).toBe(`${workItem.id}`);
      expect($card.attr('class')).toBe('card');

      expect($('#board li:nth-child(2) .cards li').length).toBe(0);
      expect($('#board li:nth-child(3) .cards li').length).toBe(0);
    });

    it('a worker picks up an item', () => {
      board.addWorkers(new Worker({dev: 1}));
      let workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
      jest.advanceTimersByTime(0);

      expect($('#board li:nth-child(1) .cards li').length).toBe(0);

      const $card = $('#board li:nth-child(2) .cards li');
      expect($card.attr('data-card-id')).toBe(`${workItem.id}`);
      expect($card.attr('class')).toBe('card');

      expect($('#board li:nth-child(3) .cards li').length).toBe(0);
    })
  });

  describe('stats', () => {
    beforeEach(() => {
      document.body.innerHTML =
        '<div id="stats-container"><span class="throughput"></span><span class="leadtime"></span><span class="wip"></span></div>';
    });

    it('shows on workitem done', () => {
      PubSub.publish('stats.calculated', {
        throughput: 1,
        leadTime: 2,
        workInProgress: 3,
        maxWorkInProgress: 4,
      });
      jest.runAllTimers();

      expect($('.throughput').text()).toBe("1");
      expect($('.leadtime').text()).toBe("2");
      expect($('.wip').text()).toBe("3 (max 4)");
    });

    it('excludes max WIP when equal to current WIP', () => {
      PubSub.publish('stats.calculated', {
        throughput: 1,
        leadTime: 2,
        workInProgress: 3,
        maxWorkInProgress: 3,
      });
      jest.runAllTimers();

      expect($('.throughput').text()).toBe("1");
      expect($('.leadtime').text()).toBe("2");
      expect($('.wip').text()).toBe("3");
    });
  });

  describe('worker-stats', () => {
    beforeEach(() => {
      document.body.innerHTML =
        '<div id="stats-container"><ul class="workers"></ul></div>';
    });

    it('adds new workers', () => {
      const worker = new Worker({dev: 0});
      jest.runAllTimers();
      expect($(`.workers [data-worker-id="${worker.id}"]`).text())
        .toEqual(`${worker.name()}: 0%`);
    });

    it('stat update', () => {
      const worker = new Worker({dev: 0});
      const newStats = {workerId: worker.id, stats: {efficiency: 0.9500111}};
      PubSub.publish('worker.stats.updated', newStats);
      jest.runAllTimers();
      expect($(`.workers [data-worker-id="${worker.id}"]`).text())
        .toEqual(`${worker.name()}: 95%`);
    });

  })
});

