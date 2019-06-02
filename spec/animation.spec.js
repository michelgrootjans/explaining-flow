const PubSub = require('pubsub-js');
const $ = require('jquery');
const animation = require('../src/animation');

const {Worker, WorkItem, WorkList} = require('../src/worker');
const Board = require('../src/board');

describe('animation', () => {
  beforeAll(() => {
    $.fx.off = true;
    jest.useFakeTimers();
    PubSub.clearAllSubscriptions();
    animation.initialize();
  });

  describe('a simple dashboard', () => {
    let board = undefined;
    let dev = undefined;
    beforeEach(() => {
      document.body.innerHTML = '<ul id="board"></ul>';
      dev = new WorkList('dev');
      board = new Board(dev);
    });

    describe('with only dev', () => {
      it('should have a backlog', () => {
        jest.runAllTimers();

        let $backlog = $('#board li:nth-child(1)');
        expect($backlog.attr('class')).toBe('column queue');
        expect($backlog.text()).toBe('Backlog');
        expect($backlog.find('ul').attr('class')).toBe('cards');
      });

      it('should have a dev', () => {
        jest.runAllTimers();

        let $dev = $('#board li:nth-child(2)');
        expect($dev.attr('class')).toBe('column work');
        expect($dev.attr('data-column-id')).toBe(`${dev.id}`);
        expect($dev.text()).toBe('dev');
        expect($dev.find('ul').attr('class')).toBe('cards');
      });

      it('should have a done', () => {
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
        '<span id="throughput"></span><span id="leadtime"></span><span id="wip"></span>';
    });

    it('shows on workitem done', () => {
      PubSub.publish('stats.calculated', {
        throughput: 1,
        leadTime: 2,
        workInProgress: 3
      });
      jest.runAllTimers();

      expect($('#throughput').text()).toBe("1");
      expect($('#leadtime').text()).toBe("2");
      expect($('#wip').text()).toBe("3");
    });
  });

  describe('worker-stats', () => {
    beforeEach(() => {
      document.body.innerHTML =
        '<div id="worker-stats"><ul class="workers"></ul></div>';
    });

    it('adds new workers', () => {
      const worker = new Worker({dev: 0});
      jest.runAllTimers();
      expect($(`#worker-stats [data-worker-id="${worker.id}"]`).text())
        .toEqual(`${worker.id}-(dev): 0%`);
    });

    it('stat update', () => {
      const worker = new Worker({dev: 0});
      const newStats = {workerId: worker.id, stats: {efficiency: 0.9500111}};
      PubSub.publish('worker.stats.updated', newStats);
      jest.runAllTimers();
      expect($(`#worker-stats [data-worker-id="${worker.id}"]`).text())
        .toEqual(`${worker.name}: 95%`);
    });

  })
});

