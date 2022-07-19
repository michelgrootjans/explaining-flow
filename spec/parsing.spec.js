const {parseWorkload, parseWorkers, parseInput} = require('../src/parsing')
const {average, poisson} = require("../src/generator");

describe('parseWorkload', () => {
  it('parses a single workload', () => {
     expect(parseWorkload('dev: 1')).toEqual({dev: 1});
     expect(parseWorkload('qa: 3')).toEqual({qa: 3});
  });

  it('parses multiple workloads', () => {
    expect(parseWorkload('dev: 1, qa: 2')).toEqual({dev: 1, qa: 2});
  });

  it('trims whitespace', () => {
    expect(parseWorkload('    dev: 1    ,  qa: 2  ')).toEqual({dev: 1, qa: 2});
  });
});

describe('parseWorkers', () => {
  it('parses a single worker with a single skill', () => {
    expect(parseWorkers('dev')).toEqual([{skills: ['dev']}]);
    expect(parseWorkers('qa')).toEqual([{skills: ['qa']}]);
  });

  it('parses multiple workers with single skills', () => {
    expect(parseWorkers('dev, qa')).toEqual([{skills: ['dev']}, {skills: ['qa']}]);
  });

  it('parses a single worker with multiple skills', () => {
    expect(parseWorkers('dev+qa')).toEqual([{skills: ['dev', 'qa']}]);
  });
})

describe('parseInput', () => {
  const exampleRawInput = {
    title: 'dev: 3, qa: 1',
    workload: 'dev: 3, qa: 1',
    workers: 'dev, qa, qa',
    wipLimit: '3',
    random: true
  };

  const exampleParsedInput = {
    title: 'dev: 3, qa: 1',
    workers: [{skills: ['dev']}, {skills: ['qa']}, {skills: ['qa']}],
    wipLimit: "3",
    distribution: poisson,
    speed: 20,
    stories: {
      amount: 200,
      work: { dev: 3, qa: 1},
    }
  };

  describe('example input was given', function () {
    it('parses raw input correctly', () => {
      expect(parseInput(exampleRawInput)).toEqual(exampleParsedInput);
    });
  });

  describe('random was checked off', function() {
    it('does not generate a distribution', () => {
      expect(parseInput({...exampleRawInput, random: false}).distribution).toBeFalsy();
    });
  });

  describe('only 2 workers provided', function() {
    let rawInputWith2Workers = {...exampleRawInput, workers: 'dev, qa'};

    it('sets speed to 1', () => {
      expect(parseInput(rawInputWith2Workers).speed).toEqual(1);
    });

    it('sets the number of stories to 50', () => {
      expect(parseInput(rawInputWith2Workers).stories.amount).toEqual(50);
    });
  });

  describe('20 stories requested', function() {
    let rawInputWith2Workers = {...exampleRawInput, numberOfStories: 20};

    it('sets speed to 1', () => {
      expect(parseInput(rawInputWith2Workers).speed).toEqual(1);
    });

    it('sets the number of stories to 20', () => {
      expect(parseInput(rawInputWith2Workers).stories.amount).toEqual(20);
    });
  });

  describe('100 stories requested', function() {
    let rawInputWith2Workers = {...exampleRawInput, numberOfStories: 100};

    it('sets speed to 1', () => {
      expect(parseInput(rawInputWith2Workers).speed).toEqual(20);
    });

    it('sets the number of stories to 100', () => {
      expect(parseInput(rawInputWith2Workers).stories.amount).toEqual(100);
    });
  });

});