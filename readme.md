# Kanban simulator
With this project, you can simulate team structure and see the effect on your team's efficiency and effectiveness.

## Using the simulator
### Initialization
`npm install`

### Running
`npm run bundle`

To modify the team structure, look at `src/setup.js` and adapt to your wishes. Then `npm run bundle` again to reopen `index.html`

## Roadmap
This project is written in a RDD fashion: Readme Driven Development. This means that this readme is the only feature tracking tool I'm using.

### Todo
- Compare 2 simulations with the same work
- Allow multiple developers with the same skillset
- Introduce [swarming](https://blog.crisp.se/2009/06/26/henrikkniberg)

### Busy
- Add stats for workers

### Done

- Make a working board
- Have a skillset per developer
- Randomize workload per story
- Randomize skill level for each developer
- Add a graph for lead times, throughput and WIP
- Introduce WIP limits
