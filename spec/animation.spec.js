const PubSub = require('pubsub-js');
const $ = require('jquery');
const animation = require('../src/animation');

const {Worker, WorkItem, WorkList} = require('../src/worker');
const Board = require('../src/board');

describe('animation', () => {
  beforeAll(() => {
    $.fx.off = true;
  });

  describe('a simple dashboard', () => {
    beforeEach(() => {
      PubSub.clearAllSubscriptions();
      animation.initialize();
      document.body.innerHTML = '<ul id="board"></ul>';
    });

    describe('with only dev', () => {
      it('should have a backlog', done => {
        PubSub.subscribe('board.shown', () => {
          let $backlog = $('#board li:nth-child(1)');
          expect($backlog.attr('class')).toBe('column queue');
          expect($backlog.text()).toBe('Backlog');
          expect($backlog.find('ul').attr('class')).toBe('cards');
          done();
        });

        const board = new Board(new WorkList('dev'));
      });
      it('should have a dev', done => {
        PubSub.subscribe('board.shown', () => {
          let $dev = $('#board li:nth-child(2)');
          expect($dev.attr('class')).toBe('column work');
          expect($dev.attr('data-column-id')).toBe(`${dev.id}`);
          expect($dev.text()).toBe('dev');
          expect($dev.find('ul').attr('class')).toBe('cards');
          done();
        });

        const dev = new WorkList('dev');
        const board = new Board(dev);
      });
      it('should have a done', done => {
        PubSub.subscribe('board.shown', () => {
          let $done = $('#board li:nth-child(3)');
          expect($done.attr('class')).toBe('column queue');
          expect($done.text()).toBe('Done');
          expect($done.find('ul').attr('class')).toBe('cards');
          done();
        });

        const board = new Board(new WorkList('dev'));
      });
    });

    it('shows work items', done => {
      PubSub.subscribe('workitem.shown', (topic, subject) => {
        const $card = $('#board li:nth-child(1) .cards li');
        expect($card.attr('data-card-id')).toBe(`${workItem.id}`);
        expect($card.attr('class')).toBe('card');

        expect($('#board li:nth-child(2) .cards li').length).toBe(0);
        expect($('#board li:nth-child(3) .cards li').length).toBe(0);

        done();
      });

      const board = new Board(new WorkList('dev'));
      let workItem = new WorkItem({dev: 1000});
      board.addWorkItems(workItem);
    });

    it('a worker picks up an item', done => {
      PubSub.subscribe('workitem.moved', (topic, subject) => {
        expect($('#board li:nth-child(1) .cards li').length).toBe(0);

        const $card = $('#board li:nth-child(2) .cards li');
        expect($card.attr('data-card-id')).toBe(`${workItem.id}`);
        expect($card.attr('class')).toBe('card');

        expect($('#board li:nth-child(3) .cards li').length).toBe(0);
        done();
      });

      const board = new Board(new WorkList('dev'));
      board.addWorkers(new Worker({dev: 1}))
      let workItem = new WorkItem({dev: 1000});
      board.addWorkItems(workItem);
    })
  });

  describe('stats', () => {
    beforeEach(() => {
      PubSub.clearAllSubscriptions();
      animation.initialize();
      document.body.innerHTML =
        '<span id="throughput"></span><span id="leadtime"></span><span id="wip"></span>';
    });

    it('shows on workitem done', done => {
      PubSub.subscribe('stats.shown', (topic, subject) => {
        expect($('#throughput').text()).toBe("1");
        expect($('#leadtime').text()).toBe("2");
        expect($('#wip').text()).toBe("3");
        done()
      });
      PubSub.publish('stats.calculated', {
        throughput: 1,
        leadTime: 2,
        workInProgress: 3
      });
    });
  });
});

