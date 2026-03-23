import Board from './board';
import { generateWorkItems } from './generator';
import { Worker } from './worker';

let counter = 1;

const Scenario = (scenario: any) => {
  const id = counter++;
  const wipLimit = scenario.wipLimit || scenario.stories.amount

  const createWorker = ({ skills: skillNames }: {skills: string[]}, speed = 1) => {
    let skills: Record<string, number> = {};
    skillNames.forEach(skillName => skills[skillName] = speed);
    return new Worker(skills);
  };

  const columnNames = () => Object.keys(scenario.stories.work);

  const generateStory = () => {
    const story: Record<string, any> = {}
    let distribute = scenario.distribution || ((identity: any) => identity);
    columnNames().forEach(key => {
      let givenValue = scenario.stories.work[key];
      story[key] = distribute(givenValue);
    });
    return story;
  };

  const run = () => {
    const board = new Board(columnNames());
    board.addWorkers(...(scenario.workers.map((workerDetails: any) => createWorker(workerDetails))));
    board.addWorkItems(...generateWorkItems(generateStory, scenario.stories.amount));
    return board;
  }

  return {...scenario, run, id, wipLimit}
};

export default (Scenario as any);
