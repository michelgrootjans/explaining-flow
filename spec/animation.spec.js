const PubSub = require('pubsub-js');
const $ = require('jquery');
const animation = require('../src/animation');

const {Worker, WorkItem, WorkList} = require('../src/worker');
const Board = require('../src/board');

describe('animation', () => {
  beforeAll(() => {
    $.fx.off = true;
  });

  describe('a new todo list', () => {
    beforeEach(() => {
      PubSub.clearAllSubscriptions();
      animation.initialize();
      document.body.innerHTML = '<ul id="dashboard"></ul>';
    });

    it('should be added to the dashboard', done => {
      PubSub.subscribe('worklist.shown', () => {
        expect($('#dashboard li.column').attr('data-column-id')).toBe(`${todo.id}`);
        expect($('#dashboard li h2').text()).toBe('todo');
        expect($('#dashboard li.column ul').attr('class')).toBe('cards');
        done();
      });

      const todo = new WorkList('todo');
    });

    it('shows work items', done => {
      PubSub.subscribe('workitem.shown', (topic, subject) => {
        expect($(`[data-column-id="${todo.id}"]     [data-card-id="${workItem.id}"]`).length).toBe(1);
        expect($(`[data-column-id="${finished.id}"] [data-card-id="${workItem.id}"]`).length).toBe(0);
        done();
      });

      const todo = new WorkList('todo');
      const finished = new WorkList('finished');
      let workItem = new WorkItem(1000);
      todo.add(workItem);
    });

    it('a worker picks up an item', done => {
      PubSub.subscribe('workitem.moved', (topic, subject) => {
        expect($(`[data-column-id="${inbox.id}"]      [data-card-id="${workItem.id}"]`).length).toBe(0);
        expect($(`[data-column-id="${inProgress.id}"] [data-card-id="${workItem.id}"]`).length).toBe(1);
        expect($(`[data-column-id="${outbox.id}"]     [data-card-id="${workItem.id}"]`).length).toBe(0);
        done();
      });

      const inbox = new WorkList('inbox');
      const inProgress = new WorkList('dev');
      const outbox = new WorkList('outbox');
      const board = new Board(inbox, inProgress, outbox);
      let workItem = new WorkItem({dev: 1000});
      board.addWorkItems(workItem);
      board.addWorkers(new Worker({dev: 1000}));
      board.runSimulation()
    })
  });

  describe('stats', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      PubSub.clearAllSubscriptions();
      animation.initialize();
      document.body.innerHTML =
        '<span id="throughput"></span><span id="leadtime"></span>\n';
    });

    it('shows on workitem done', function () {
      PubSub.publish('workitem.done',
        [{startTime: new Date(2000,1,1, 0,0,0), endTime: new Date(2000,1,1, 0,0,2)}]
      );
      jest.runAllTimers();
      expect($('#throughput').text()).toBe("0.5");
      expect($('#leadtime').text()).toBe("2");
    });
  });
});

