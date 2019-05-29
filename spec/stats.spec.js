const Stats = require('../src/stats');
const PubSub = require('pubsub-js');

describe('calculate basic stats', () => {
  beforeEach(() => {
    PubSub.clearAllSubscriptions();
    Stats.initialize();
  });

  it('start', done => {
    after(1).times('stats.calculated', (topic, stats) => {
      expect(stats).toEqual({
        throughput: 0,
        leadTime: 0,
        workInProgress: 1
      });
      done();
    });

    PubSub.publish('workitem.started', {});
  });

  it('start-start', done => {
    after(2).times('stats.calculated', (topic, stats) => {
      expect(stats).toEqual({
        throughput: 0,
        leadTime: 0,
        workInProgress: 2
      });
      done();
    });

    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.started', {});
  });

  it('start-finish(1)', done => {
    after(2).times('stats.calculated', (topic, stats) => {
      expect(stats).toEqual({
        throughput: 1,
        leadTime: 1,
        workInProgress: 0
      });
      done();
    });

    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(1),});
  });

  it('start-start-finish(1)', done => {
    after(3).times('stats.calculated', (topic, stats) => {
      expect(stats).toEqual({
        throughput: 1,
        leadTime: 1,
        workInProgress: 1
      });
      done();
    });

    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(1),});
  });

  it('start-start-finish(2)', done => {
    after(2).times('stats.calculated', (topic, stats) => {
      expect(stats).toEqual({
        throughput: 0.5,
        leadTime: 2,
        workInProgress: 0
      });
      done();
    });

    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(2),});
  });

  function time(second) {
    return new Date(2000,1,1, 0,0,second+1);
  }

  function after(turns) {
    let callCounter = 0;
    return {
      times: (message, f) => {
        PubSub.subscribe(message, (topic, subject) => {
          callCounter++;
          if (callCounter === turns) {
            f(topic, subject);
          }
        });
      }
    }
  }
});

