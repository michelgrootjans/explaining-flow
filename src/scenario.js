const Board = require("./board");
const {generateWorkItems} = require("./generator");
const {Worker, SimpleSkillStrategy} = require('./worker')

let counter = 1;

const Scenario = scenario => {
  const id = counter++;
  const wipLimit = scenario.wipLimit || scenario.stories.amount

  const createWorker = ({ skills: skillNames }, speed = 1) => {
    let skills = {};
    skillNames.forEach(skillName => skills[skillName] = speed);
    return new Worker(new SimpleSkillStrategy(skills));
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
    board.addWorkers(...(scenario.workers.map(workerDetails => createWorker(workerDetails))));
    board.addWorkItems(...generateWorkItems(generateStory, scenario.stories.amount));
    return board;
  }

  return {...scenario, run, id, wipLimit}
};

module.exports = Scenario