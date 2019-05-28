const Stats = require('../src/stats');

describe('calculate basic stats', () => {
  it('has no output for no input', function () {
    let stats = new Stats([]);
    expect(stats).toEqual({
      leadTime: 0,
      throughput: 0
    })
  });
  it('has no output for no valid input', function () {
    let stats = new Stats([{}, {}, {}]);
    expect(stats).toEqual({
      leadTime: 0,
      throughput: 0
    })
  });
  it('calculates for an item of 1 second', function () {
    let stats = new Stats([
      {startTime: new Date(2000,1,1, 0,0,0), endTime: new Date(2000,1,1, 0,0,1)}
    ]);
    expect(stats).toEqual({
      leadTime: 1,
      throughput: 1
    })
  });
  it('calculates for an item of 2 seconds', function () {
    let stats = new Stats([
      {startTime: new Date(2000,1,1, 0,0,0), endTime: new Date(2000,1,1, 0,0,2)}
    ]);
    expect(stats).toEqual({
      leadTime: 2,
      throughput: 1
    })
  });
});

