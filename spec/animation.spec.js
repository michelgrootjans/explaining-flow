const PubSub = require('pubsub-js');
const animation = require('../src/animation');

const {Worker, WorkItem} = require('../src/worker');
const Board = require('../src/board');

const find = selector => document.querySelector(selector);

describe('animation', () => {
  beforeAll(() => {
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

        let $backlog = find('#board div:nth-child(1)');
        expect($backlog.getAttribute('class')).toBe('col col-1 todo');
        expect($backlog.querySelector('h5').firstChild.textContent).toBe('Backlog');
        expect($backlog.querySelector('ul').getAttribute('class')).toBe('cards');
      });

      it('should have a dev column', () => {
        jest.runAllTimers();

        let $dev = find('#board div:nth-child(2)');
        expect($dev.getAttribute('class')).toBe('col col-1 work');
        expect($dev.querySelector('h5').firstChild.textContent).toBe('dev');
        expect($dev.querySelector('ul').getAttribute('class')).toBe('cards');
      });

      it('should have a done column', () => {
        jest.runAllTimers();

        let $done = find('#board div:nth-child(3)');
        expect($done.getAttribute('class')).toBe('col col-1 done');
        expect($done.querySelector('h5').firstChild.textContent).toBe('Done');
        expect($done.querySelector('ul').getAttribute('class')).toBe('cards');
      });
    });

    it('shows work items', () => {
      let workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
      jest.advanceTimersByTime(0);

      const $card = find('#board div:nth-child(1) .cards li');
      expect($card.getAttribute('data-card-id')).toBe(`${workItem.id}`);
      expect($card.getAttribute('class')).toContain('post-it');

      expect(find('#board div:nth-child(2) .cards').innerHTML).toBe('');
      expect(find('#board div:nth-child(3) .cards').innerHTML).toBe('');
    });

    it('a worker picks up an item', () => {
      board.addWorkers(new Worker({dev: 1}));
      let workItem = new WorkItem({dev: 1});
      board.addWorkItems(workItem);
      jest.advanceTimersByTime(1);

      expect(find('#board div:nth-child(1) .cards').innerHTML).toBe('');

      const $card = find('#board div:nth-child(2) .cards li');
      expect($card.getAttribute('data-card-id')).toBe(`${workItem.id}`);
      expect($card.getAttribute('class')).toContain('post-it');

      expect(find('#board div:nth-child(3) .cards').innerHTML).toBe('');
    })

    it('shows card amount', () => {
      board.addWorkers(new Worker({dev: 1}));
      board.addWorkItems(new WorkItem({dev: 1}));
      jest.advanceTimersByTime(1);

      expect(find('#board div:nth-child(1) h5 .amount').innerHTML).toBe('0');
      expect(find('#board div:nth-child(2) h5 .amount').innerHTML).toBe('1');
      expect(find('#board div:nth-child(3) h5 .amount').innerHTML).toBe('0');
    })

  });

  describe('stats', () => {
    beforeEach(() => {
      document.body.innerHTML =
        '<div id="stats-container">' +
        '    <span class="throughput"></span>' +
        '    <span class="leadtime"></span>' +
        '    <span class="wip"></span>' +
        '    <span class="timeWorked"></span>' +
        '</div>';
    });

    it('shows on workitem done', () => {
      PubSub.publish('stats.calculated', {
        throughput: 1,
        leadTime: 2,
        averageWip: 3,
        maxWorkInProgress: 4,
        timeWorked: 5
      });
      jest.runAllTimers();

      expect(find('.throughput').innerHTML).toBe("1");
      expect(find('.leadtime').innerHTML).toBe("2");
      expect(find('.wip').innerHTML).toBe("3 (max 4)");
      expect(find('.timeWorked').innerHTML).toBe("5");
    });

    it('excludes max WIP when equal to current WIP', () => {
      PubSub.publish('stats.calculated', {
        throughput: 1,
        leadTime: 2,
        averageWip: 3,
        maxWorkInProgress: 3,
        timeWorked: 5
      });
      jest.runAllTimers();

      expect(find('.throughput').innerHTML).toBe("1");
      expect(find('.leadtime').innerHTML).toBe("2");
      expect(find('.wip').innerHTML).toBe("3");
      expect(find('.timeWorked').innerHTML).toBe("5");
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
      let $worker = find(`.workers [data-worker-id="${worker.id}"]`);
      expect($worker.querySelector('.name').innerHTML).toEqual(`${worker.name()}: `);
      expect($worker.querySelector('.stat').innerHTML).toEqual('0%');
    });

    it('stat update', () => {
      const worker = new Worker({dev: 0});
      const newStats = {workerId: worker.id, stats: {efficiency: 0.9500111}};
      PubSub.publish('worker.stats.updated', newStats);
      jest.runAllTimers();
      let $worker = find(`.workers [data-worker-id="${worker.id}"]`);
      expect($worker.querySelector('.name').innerHTML).toEqual(`${worker.name()}: `);
      expect($worker.querySelector('.stat').innerHTML).toEqual('95%');
    });
  })
});

