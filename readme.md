# Kanban simulator
With this project, you can simulate team structure and see the effect on your team's efficiency and effectiveness.

## Using the simulator
### Initialization
npm install
npm run bundle

### Running
open `index.html`

To modify the team structure, look at `src/setup.js` and adapt to your wishes. Then `npm run bundle` again and refresh `index.html`

## Roadmap
This project is written in a RDD fashion: Readme Driven Development. This means that this readme is the only feature tracking tool. Here are the upcoming features:

### Todo

- Introduce WIP limits
- Allow multiple developers with the same skillset
- Introduce [swarming](https://blog.crisp.se/2009/06/26/henrikkniberg)
- Add a graph for lead times, throughput and WIP
- Add stats for workers

### Done

- Make a working board
- Have a skillset per developer
- Randomize workload per story
- Randomize skill level for each developer