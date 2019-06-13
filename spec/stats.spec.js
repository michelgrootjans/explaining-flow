const Stats = require('../src/stats');
const PubSub = require('pubsub-js');

describe('calculate basic stats', () => {
  beforeEach(() => {
    PubSub.clearAllSubscriptions();
    Stats.initialize();
  });

  it('start', done => {
    given(() => [
      PubSub.publish('workitem.started', {startTime: 1})
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 0,
          leadTime: 0,
          workInProgress: 1
        });
        done();
      });

  });

  it('start-start', done => {
    given(() => [
      PubSub.publish('workitem.started', {startTime: 1}),
      PubSub.publish('workitem.started', {startTime: 1})
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 0,
          leadTime: 0,
          workInProgress: 2
        });
        done();
      });

  });

  it('start-finish(1)', done => {
    given(() => [
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(1),})
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 1,
          leadTime: 1,
          workInProgress: 0
        });
        done();
      });

  });

  it('start-start-finish(1)', done => {
    given(() => [
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(1),}),
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 1,
          leadTime: 1,
          workInProgress: 1
        });
        done();
      });
  });

  it('start-start-finish(2)', done => {
    given(() => [
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(2),}),
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: 0.5,
          leadTime: 2,
          workInProgress: 0
        });
        done();
      });
  });

  it('realistic example', done => {
    given(() => [
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(1),}),
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.finished', {startTime: time(0), endTime: time(3),}),
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.finished', {startTime: time(1), endTime: time(5),}),
      PubSub.publish('workitem.started', {}),
      PubSub.publish('workitem.finished', {startTime: time(3), endTime: time(4),}),
      PubSub.publish('workitem.started', {}),
    ])
      .then('stats.calculated', (topic, stats) => {
        expect(stats).toMatchObject({
          throughput: numberOfFinishedItems * 1000 / (maxTime - minTime),
          leadTime: (individualDurations) / numberOfFinishedItems,
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
    let expectedEvents = publications();
    let callCounter = 0;
    return {
      then: (message, f) => {
        PubSub.subscribe(message, (topic, subject) => {
          callCounter++;
          if (callCounter === expectedEvents.length) {
            f(topic, subject);
          }
        });
      }
    }
  }
});

