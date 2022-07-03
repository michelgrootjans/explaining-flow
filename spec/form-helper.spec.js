const {validateWork, validateWorkers} = require("../src/form-helper");

describe('validate workload', () => {
  it.each([
    'dev: 1',
    'dev: 1, qa: 1',
    'dev: 1, qa:1',
    'dev: 1,qa: 1',
    'dev: 1 , qa: 1',
    'dev:1 , qa: 1',
    ' dev  :  1 , qa     :   1   ',
  ])('should validate [%s]', (workload) => expect(validateWork({workload})).toBeTruthy());

  it.each([
    '',
    ':',
    ': 1',
    'dev',
    'dev:',
    'dev: qa',
    'dev, qa',
  ])('should not validate [%s]', (workload) => expect(validateWork({workload})).toBeFalsy());
});

describe('validate format of workers', () => {
  it.each([
    'dev',
    ' dev',
    'dev ',
    ' dev ',
    '     dev    ',
    'dev+qa',
  ])('should validate with single worker [%s]', (workers) => expect(validateWorkers({workload: 'dev: 1', workers})).toBeTruthy());

  it.each([
    'dev, qa',
    'dev, qa ',
    'dev,qa',
    '   dev , qa   ',
  ])('should validate with two workers [%s]', (workers) => expect(validateWorkers({workload: 'dev: 1', workers})).toBeTruthy());

  it.each([
    '',
    'dev,',
    'dev: 1',
    'dev: qa',
    'dev, ,qa',
  ])('should not validate [%s]', (workers) => expect(validateWorkers({workers})).toBeFalsy());
});

describe('validate work and workers', () => {
  it.each([
    ['dev: 1', 'dev'],
    ['dev: 1, qa: 1', 'dev, qa'],
    ['dev: 1, qa: 1', 'qa, dev'],
    ['dev: 1, qa: 1', 'fullstack'],
    ['dev: 1, qa: 1', 'fs'],
    ['ux: 1, dev: 1, qa: 1', 'ux, dev, qa'],
    ['ux: 1, dev: 1, qa: 1', 'fs'],
    ['ux: 1, dev: 1, qa: 1', 'fullstack'],
  ])('should validate [%s -> %s]', (workload, workers) => expect(validateWorkers({workload, workers})).toBeTruthy());

  it.each([
    ['dev: 1', ''],
    ['dev: 1', 'qa'],
    ['ux: 1, dev: 1, qa: 1', 'dev, qa'],
    ['ux: 1, dev: 1, qa: 1', 'ux, qa'],
    ['ux: 1, dev: 1, qa: 1', 'ux, dev'],
  ])('should not validate [%s -> %s]', (workload, workers) => expect(validateWorkers({workload, workers})).toBeFalsy());
});