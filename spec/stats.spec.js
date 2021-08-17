const Stats = require('../src/stats');
const {publish, subscribe, clearAllSubscriptions} = require('pubsub-js');

describe('calculate basic stats', () => {
  beforeEach(() => {
    clearAllSubscriptions();
    Stats.initialize();
  });

  it('start', done => {
    given(() => [
      publish('workitem.started', {startTime: 1})
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 0,
          cycleTime: 0,
          workInProgress: 1
        });
        done();
      });

  });

  it('start-start', done => {
    given(() => [
      publish('workitem.started', {startTime: 1}),
      publish('workitem.started', {startTime: 1})
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 0,
          cycleTime: 0,
          workInProgress: 2
        });
        done();
      });

  });

  it('start-finish(1)', done => {
    given(() => [
      publish('workitem.started', {}),
      publish('workitem.finished', {startTime: time(0), endTime: time(1),})
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 1,
          cycleTime: 1,
          workInProgress: 0
        });
        done();
      });

  });

  it('start-start-finish(1)', done => {
    given(() => [
      publish('workitem.started', {}),
      publish('workitem.started', {}),
      publish('workitem.finished', {startTime: time(0), endTime: time(1),}),
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 1,
          cycleTime: 1,
          workInProgress: 1
        });
        done();
      });
  });

  it('start-start-finish(2)', done => {
    given(() => [
      publish('workitem.started', {}),
      publish('workitem.finished', {startTime: time(0), endTime: time(2),}),
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 0.5,
          cycleTime: 2,
          workInProgress: 0
        });
        done();
      });
  });

  it('realistic example', done => {
    given(() => [
      publish('workitem.started', {}),
      publish('workitem.started', {}),
      publish('workitem.finished', {startTime: time(0), endTime: time(1),}),
      publish('workitem.started', {}),
      publish('workitem.finished', {startTime: time(0), endTime: time(3),}),
      publish('workitem.started', {}),
      publish('workitem.finished', {startTime: time(1), endTime: time(5),}),
      publish('workitem.started', {}),
      publish('workitem.finished', {startTime: time(3), endTime: time(4),}),
      publish('workitem.started', {}),
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: numberOfFinishedItems * 1000 / (maxTime - minTime),
          cycleTime: (individualDurations) / numberOfFinishedItems,
          workInProgress: 2
        });
        done();
      });

    const individualDurations = 1 + 3 + 4 + 1;
    const numberOfFinishedItems = 4;
    const minTime = time(0);
    const maxTime = time(5);
  });

  function time(second) {
    return new Date(2000, 1, 1, 1, 0, second);
  }

  function given(publications) {
    publish('board.ready', {}) // necessary to initialize stats
    let expectedEvents = publications();
    let callCounter = 0;
    return {
      then: (message, f) => {
        subscribe(message, (topic, subject) => {
          callCounter++;
          if (callCounter === expectedEvents.length) {
            f(topic, subject);
          }
        });
      }
    }
  }
});

