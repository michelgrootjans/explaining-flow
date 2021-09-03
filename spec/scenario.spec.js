const animation = require('../src/animation');
const PubSub = require("pubsub-js");
const Range = require('../src/range')
const Scenario = require('../src/scenario')


describe('scenario', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(PubSub.clearAllSubscriptions)

  beforeEach(() => {
    document.body.innerHTML = `
        <div id="stats">
          <div id="scenarios"></div>
        </div>
        <ul id="board"></ul>
    `;
    animation.initialize("#stats-container");
  });

  const numberOfCardsInColumn = (columnNumber) => document.querySelectorAll(`#board ${(`.column:nth-child(${columnNumber})`)} .card`).length;
  const numberOfColumns = () => document.querySelectorAll('.column').length;
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
      jest.advanceTimersByTime(0);
      expect(cardsInColumns()).toEqual([9, 1, 0]);
    });
    it('starts working on second story after 1 unit of time', () => {
      jest.advanceTimersByTime(1000);
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
    it('starts working immidiately', () => {
      jest.advanceTimersByTime(0);
      expect(cardsInColumns()).toEqual([9, 1, 0, 0, 0]);
    });
    it('starts working on second story after 1 unit of time', () => {
      jest.advanceTimersByTime(1000);
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
      jest.advanceTimersByTime(0);
      expect(cardsInColumns()).toEqual([9, 1, 0, 0, 0]);
    });
    it('starts working on second story after 1 unit of time', () => {
      jest.advanceTimersByTime(1000);
      expect(cardsInColumns()).toEqual([9, 0, 0, 1, 0]);
    });
  });

});
