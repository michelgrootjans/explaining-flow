const PubSub = require('pubsub-js');
const $ = require('jquery');
const animation = require('../src/animation');

const {Worker, WorkItem, WorkList} = require('../src/worker');


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
        expect($('#dashboard li.column').data('column-id')).toBe(todo.id);
        expect($('#dashboard li h2').text()).toBe('todo');
        expect($('#dashboard li.column ul').attr('class')).toBe('cards');
        done();
      });

      const todo = new WorkList('todo');
    });

    it('shows work items', done => {
      PubSub.subscribe('workitem.shown', (topic, subject) => {
        expect($('#dashboard li.column ul.cards li').text()).toBe(`${workItem.id}`);
        done();
      });

      const todo = new WorkList('todo');
      let workItem = new WorkItem(1000);
      todo.add(workItem);
    });

  });
});