const animation = require('../src/animation');
const {clearAllSubscriptions} = require('../src/publish-subscribe')
const Range = require('../src/range')
const Scenario = require('../src/scenario')


describe('scenario', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(clearAllSubscriptions)

  beforeEach(() => {
    document.body.innerHTML = `
        <div id="stats">
          <div id="scenarios"></div>
        </div>
        <ul id="board"></ul>
    `;
    animation.initialize("#stats-container");
  });

  const numberOfCardsInColumn = (columnNumber) => document.querySelectorAll(`#board ${(`.col:nth-child(${columnNumber})`)} .post-it`).length;
  const numberOfColumns = () => document.querySelectorAll('.col').length;
  const cardsInColumns = () => Range(1, numberOfColumns()).map(numberOfCardsInColumn);
  const run = scenario => Scenario(scenario).run();


  describe('no workers available', () => {
    beforeEach(() => {
      run({
        id: 1,
        workers: [],
        stories: {
          amount: 10,
          work: {'dev': 1}
        }
      });
    });
    it('renders nothing initially', () => {
      expect(cardsInColumns()).toEqual([]);
    });
    it('renders board when timer starts', () => {
      jest.advanceTimersByTime(0);
      expect(cardsInColumns()).toEqual([10, 0, 0]);
    });
  });

  describe('one worker', () => {
    beforeEach(() => {
      run({
        id: 1,
        workers: [{ skills: ['dev'] }],
        stories: {
          amount: 10,
          work: {'dev': 1}
        }
      });
    });
    it('starts working immidiately', () => {
      jest.advanceTimersByTime(1);
      expect(cardsInColumns()).toEqual([9, 1, 0]);
    });
    it('starts working on second story after 1 unit of time', () => {
      jest.advanceTimersByTime(1009);
      expect(cardsInColumns()).toEqual([8, 1, 1]);
    });
  });

  describe('two tasks', () => {
    beforeEach(() => {
      run({
        id: 1,
        workers: [{ skills: ['dev'] }, { skills: ['qa'] }],
        stories: {
          amount: 10,
          work: {'dev': 1, 'qa': 1}
        }
      });
    });
    it('starts working immediately', () => {
      jest.advanceTimersByTime(1);
      expect(cardsInColumns()).toEqual([9, 1, 0, 0, 0]);
    });
    it('starts working on second story after 1 unit of time', () => {
      jest.advanceTimersByTime(1009);
      expect(cardsInColumns()).toEqual([8, 1, 0, 1, 0]);
    });
  });

  describe('one fullstack worker', () => {
    beforeEach(() => {
      run({
        id: 1,
        workers: [{ skills: ['all'] }],
        stories: {
          amount: 10,
          work: {'dev': 1, 'qa': 1}
        }
      });
    });
    it('starts working immidiately', () => {
      jest.advanceTimersByTime(1);
      expect(cardsInColumns()).toEqual([9, 1, 0, 0, 0]);
    });
    it('starts working on second story after 1 unit of time', () => {
      jest.advanceTimersByTime(1009);
      expect(cardsInColumns()).toEqual([9, 0, 0, 1, 0]);
    });
  });

});
