const Board = require("./board");
const {generateWorkItems} = require("./generator");
const {Worker} = require('./worker')

let counter = 1;

const Scenario = scenario => {
  const id = counter++;
  const wipLimit = scenario.wipLimit || scenario.stories.amount

  const createWorker = (skillName, speed = 1) => {
    let skills = {};
    skills[skillName] = speed
    return new Worker(skills);
  };

  const columnNames = () => Object.keys(scenario.stories.work);

  const generateStory = () => {
    const story = {}
    let distribute = scenario.distribution || (identity => identity);
    columnNames().forEach(key => {
      let givenValue = scenario.stories.work[key];
      story[key] = distribute(givenValue);
    });
    return story;
  };

  const run = () => {
    const board = new Board(columnNames());
    board.addWorkers(...(scenario.workers.map(skill => createWorker(skill))));
    board.addWorkItems(...generateWorkItems(generateStory, scenario.stories.amount));
    return board;
  }

  return {...scenario, run, id, wipLimit}
};

module.exports = Scenario