const Stats = require('../src/stats');
const {performance} = require("../src/stats");

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
          leadTime: 0,
          workInProgress: 1,
          timeWorked: 0
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
          leadTime: 0,
          workInProgress: 2
        });
        done();
      });

  });

  it('start-finish(1)', done => {
    given(() => [
      publish('workitem.started', {}),
      publish('workitem.finished', {item: {startTime: time(0), endTime: time(1),}})
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
      publish('workitem.started', {}),
      publish('workitem.started', {}),
      publish('workitem.finished', {item: {startTime: time(0), endTime: time(1),}}),
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
      publish('workitem.started', {}),
      publish('workitem.finished', {item: {startTime: time(0), endTime: time(2),}}),
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
      publish('workitem.started', {}),
      publish('workitem.started', {}),
      publish('workitem.finished', {item: {startTime: time(0), endTime: time(1),}}),
      publish('workitem.started', {}),
      publish('workitem.finished', {item: {startTime: time(0), endTime: time(3),}}),
      publish('workitem.started', {}),
      publish('workitem.finished', {item: {startTime: time(1), endTime: time(5),}}),
      publish('workitem.started', {}),
      publish('workitem.finished', {item: {startTime: time(3), endTime: time(4),}}),
      publish('workitem.started', {}),
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

describe('calculate performance', () => {
  it('without items', () => {
    expect(performance([])).toMatchObject({throughput: 0, leadTime: 0})
  });

  it('with one item', () => {
    expect(performance([
      {startTime: 0, endTime: 1000},
    ])).toMatchObject({throughput: 1, leadTime: 1})
    expect(performance([
      {startTime: 0, endTime: 500},
    ])).toMatchObject({throughput: 2, leadTime: 0.5})
    expect(performance([
      {startTime: 0, endTime: 2000},
    ])).toMatchObject({throughput: 0.5, leadTime: 2})
  });

  it('with 2 consecutive items', () => {
    expect(performance([
      {startTime: 0, endTime: 1000},
      {startTime: 1000, endTime: 2000},
    ])).toMatchObject({throughput: 1, leadTime: 1})
    expect(performance([
      {startTime: 0, endTime: 500},
      {startTime: 500, endTime: 1000},
    ])).toMatchObject({throughput: 2, leadTime: 0.5})
  });
  it('with 3 consecutive items', () => {
    expect(performance([
      {startTime: 0, endTime: 1000},
      {startTime: 1000, endTime: 2000},
      {startTime: 2000, endTime: 3000},
    ])).toMatchObject({throughput: 1, leadTime: 1})
    expect(performance([
      {startTime: 0, endTime: 500},
      {startTime: 500, endTime: 1000},
      {startTime: 1000, endTime: 1500},
    ])).toMatchObject({throughput: 2, leadTime: 0.5})
  });

  it('with 2 parallel items', () => {
    expect(performance([
      {startTime: 0, endTime: 1000},
      {startTime: 0, endTime: 1000},
    ])).toMatchObject({throughput: 2, leadTime: 1})
    expect(performance([
      {startTime: 0, endTime: 500},
      {startTime: 0, endTime: 500},
    ])).toMatchObject({throughput: 4, leadTime: 0.5})
  });
  it('with 3 parallel items', () => {
    expect(performance([
      {startTime: 0, endTime: 1000},
      {startTime: 0, endTime: 1000},
      {startTime: 0, endTime: 1000},
    ])).toMatchObject({throughput: 3, leadTime: 1})
    expect(performance([
      {startTime: 0, endTime: 500},
      {startTime: 0, endTime: 500},
      {startTime: 0, endTime: 500},
    ])).toMatchObject({throughput: 6, leadTime: 0.5})
  });

  it('with five consecutive items', () => {
    expect(performance([
      {startTime: 2000, endTime: 3000},
      {startTime: 3000, endTime: 4000},
      {startTime: 4000, endTime: 5000},
      {startTime: 5000, endTime: 6000},
      {startTime: 6000, endTime: 7000},
    ])).toMatchObject({throughput: 1, leadTime: 1})
  });

  it('with five parallel items', () => {
    expect(performance([
      {startTime: 0, endTime: 1000},
      {startTime: 0, endTime: 1000},
      {startTime: 0, endTime: 1000},
      {startTime: 0, endTime: 1000},
      {startTime: 0, endTime: 1000},
    ])).toMatchObject({throughput: 5, leadTime: 1})
    expect(performance([
      {startTime: 0, endTime: 5000},
      {startTime: 0, endTime: 5000},
      {startTime: 0, endTime: 5000},
      {startTime: 0, endTime: 5000},
      {startTime: 0, endTime: 5000},
    ])).toMatchObject({throughput: 1, leadTime: 5})
  });
})