const {publish, subscribe, clearAllSubscriptions} = require('../src/publish-subscribe')
const {Worker} = require('../src/worker');
const WorkerStats = require('../src/worker-stats');

describe('worker stats', () => {
  beforeEach(jest.useFakeTimers);
  afterEach(jest.runAllTimers);

  let latestStats = undefined;
  beforeEach(() => {
    clearAllSubscriptions();
    new WorkerStats();
    latestStats = {};
    subscribe('worker.stats.updated', (topic, stats) => latestStats[stats.workerId] = stats.stats);
  });

  it('when worker is idle', () => {
    const worker = new Worker({dev: 1});
    publishAt(0, 'worker.idle', {worker});
    expect(latestStats[worker.id]).toMatchObject({efficiency: 0});
  });

  it('when worker is working', () => {
    const worker = new Worker({dev: 1});
    publishAt(0, 'worker.working', {worker});
    expect(latestStats[worker.id]).toMatchObject({efficiency: 1});
  });

  it('when worker is working 50%', () => {
    const worker = new Worker({dev: 1});
    publishAt(0, 'worker.working', {worker});
    publishAt(10, 'worker.idle', {worker});
    publishAt(20, 'worker.working', {worker});

    expect(latestStats[worker.id]).toMatchObject({efficiency: 0.5});
  });

  it('when worker is working 10%', () => {
    const worker = new Worker({dev: 1});
    publishAt(0, 'worker.working', {worker});
    publishAt(1, 'worker.idle', {worker});
    publishAt(10, 'worker.working', {worker});

    expect(latestStats[worker.id]).toMatchObject({efficiency: 0.1});
  });

  it('when worker is working 90%', () => {
    const worker = new Worker({dev: 1});
    publishAt(0, 'worker.working', {worker});
    publishAt(9, 'worker.idle', {worker});
    publishAt(10, 'worker.working', {worker});

    expect(latestStats[worker.id]).toMatchObject({efficiency: 0.9});
  });

  it('with 2 workers', () => {
    const worker1 = new Worker({dev: 1});
    const worker2 = new Worker({dev: 1});
    publishAt(0, 'worker.working', {worker: worker1});

    expect(latestStats[worker1.id]).toMatchObject({efficiency: 1});
    expect(latestStats[worker2.id]).toMatchObject({efficiency: 0});
  });

  function publishAt(second, topic, worker) {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => new Date(2000, 1, 1, 0, 0, second));
    publish(topic, worker);
    jest.runAllTimers();
  }
});