const Stats = require('../src/stats');
const PubSub = require('pubsub-js');

describe('calculate basic stats', () => {
  beforeEach(() => {
    PubSub.clearAllSubscriptions();
    Stats.initialize();
  });

  it('start', done => {
    after(1).times('stats.calculated', (topic, stats) => {
      expect(stats).toMatchObject({
        throughput: 0,
        leadTime: 0,
        workInProgress: 1
      });
      done();
    });

    PubSub.publish('workitem.started', {startTime: 1});
  });

  it('start-start', done => {
    after(2).times('stats.calculated', (topic, stats) => {
      expect(stats).toMatchObject({
        throughput: 0,
        leadTime: 0,
        workInProgress: 2
      });
      done();
    });

    PubSub.publish('workitem.started', {startTime: 1});
    PubSub.publish('workitem.started', {startTime: 1});
  });

  it('start-finish(1)', done => {
    after(2).times('stats.calculated', (topic, stats) => {
      expect(stats).toMatchObject({
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
      expect(stats).toMatchObject({
        throughput: 1,
        leadTime: 1,
        workInProgress: 1
      });
      done();
    });

    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.started', {startTime: time(0)});
    PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(1),});
  });

  it('start-start-finish(2)', done => {
    after(2).times('stats.calculated', (topic, stats) => {
      expect(stats).toMatchObject({
        throughput: 0.5,
        leadTime: 2,
        workInProgress: 0
      });
      done();
    });

    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(2),});
  });

  it('realistic example', done => {
    after(10).times('stats.calculated', (topic, stats) => {
      expect(stats).toMatchObject({
        throughput: numberOfFinishedItems * 1000/(maxTime- minTime),
        leadTime: (individualDurations)/ numberOfFinishedItems,
        workInProgress: 2
      });
      done();
    });

    const individualDurations = 1+3+4+1;
    const numberOfFinishedItems = 4;
    const minTime = time(0);
    const maxTime = time(5);

    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(1),});
    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(3),});
    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.finished', {startTime: time(1), endTime: time(5),});
    PubSub.publish('workitem.started', {});
    PubSub.publish('workitem.finished', {startTime: time(3), endTime: time(4),});
    PubSub.publish('workitem.started', {});
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

