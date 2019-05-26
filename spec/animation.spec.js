const PubSub = require('pubsub-js');
const $ = require('jquery');
require('../src/animation');
const {Worker, WorkItem, WorkList} = require('../src/worker');


describe('animation', () => {
  beforeAll(() => {
    $.fx.off = true;
  });

  describe('add dashboard', () => {
    beforeEach(() => {
      document.body.innerHTML = '<ul id="dashboard"></ul>';
    });

    it('should add the dashboard', done => {
      PubSub.subscribe('worklist.shown', () => {
        expect($('#dashboard').text()).toBe('todo');
        done();
      });
      new WorkList('todo');
    });

  });
});