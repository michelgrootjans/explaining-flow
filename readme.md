# Kanban simulator
With this project, you can simulate team structure and see the effect on your team's efficiency and effectiveness.

The measurements you get for each simulation are:
- Throughput: the number of stories the team finishes per unit of time. Typically referred to as team velocity.
- Lead time: the amount of time an item has to wait between the moment someone started working on it and the moment is finished.
- WIP: the number of items started but not finished

Stakeholders and customers typically worry about throughput and lead time. Throughput indicates how efficient a team is. Lead time indicates how long stakeholders have to wait for their ideas to be implemented.

## Using the simulator
### Initialization
`npm install`

### Running
`npm run bundle`

To modify the team structure, look at `src/setup.js` and adapt to your wishes. Then `npm run bundle` again to reopen `index.html`

## My lightning talk
My lighting talk is structured around the following steps:
- edit `setup.js`
- `npm run bundle` to show the simulation
- rinse and repeat

The following chapters show the steps in my talk by showing the changes to do in `setup.js`

#### a single developer working on a predictable backlog
``` javascript
let board = new Board(
  new WorkList('dev'),
);

board.addWorkers(
  new Worker({dev: 1}),
);

board.addWorkItems(...generateWorkItems(() => ({
    dev: 1,
  }), 50
));
```

#### a single developer working on a backlog with some randomness
This slight change illustrate that throughput and lead time move in opposite directions. This is a direct illustration of [Little's law](https://en.wikipedia.org/wiki/Little%27s_law).
``` javascript
// ... the previous code remains the same
board.addWorkItems(...generateWorkItems(() => ({
    dev: randomBetween(0,2),
  }), 50
));
```

#### adding QA to the process
Depending on the randomness of the simulation, a queue will appear between dev and qa. Every time the queue gets larger, lead time will increase, while throughput will be mostly unaffected (averaging to 1 story/day).

``` javascript
let board = new Board(
  new WorkList('dev'),
  new WorkList('qa'), // <= new
);

board.addWorkers(
  new Worker({dev: 1}),
  new Worker({qa: 1}), // <= new
);

board.addWorkItems(...generateWorkItems(() => ({
    dev: randomBetween(0,2),
    qa: randomBetween(0,2), // <= new
  }), 50
));
```

#### adding UX to the process
Let's also accelerate the simulation. This allows us to see patterns we wouldn't recognise in the slow daily movements of stories on a board

``` javascript
TimeAdjustments.speedUpBy(20); // <= accelerate the simulation

let board = new Board(
  new WorkList('ux'), // <= new
  new WorkList('dev'),
  new WorkList('qa'),
);

board.addWorkers(
  new Worker({ux: 1}), // <= new
  new Worker({dev: 1}),
  new Worker({qa: 1}),
);

board.addWorkItems(...generateWorkItems(() => ({
    ux: randomBetween(0,2), // <= new
    dev: randomBetween(0,2),
    qa: randomBetween(0,2),
  }), 200 // <= increase the number of stories
));
```

#### let's stack the deck to make development the slowest in the process

``` javascript
// the previous code remains the same
board.addWorkItems(...generateWorkItems(() => ({
    ux: randomBetween(0,2),
    dev: randomBetween(0,4), // <= slowest
    qa: randomBetween(0,3),
  }), 200
));
```
Predictably, a queue will appear in front of the dev column. The usual reflex at this point is to add developers ;-)
But what would be the expected outcome? Twice the throughput? Let's try that out in the next simulation.

Results:
- Throughput: about 0.45 stories/day
- Lead time: about 100 days.

#### let's add an extra developer

``` javascript
// ...the previous code remains the same
board.addWorkers(
  new Worker({ux: 1}),
  new Worker({dev: 1}),
  new Worker({dev: 1}), // <= second developer
  new Worker({qa: 1}),
);
// ... the rest of the code code remains the same
```
Results:
- Throughput: about 0.6 stories/day (slightly improved)
- Lead time: about 50 days (improved with a factor of 2)
- Cost: +1 team member


#### Let's go to the previous step and introduce a WIP-limit instead of a new developer
``` javascript
let board = new Board(
  new WorkList('ux'),
  new WorkList('dev'),
  new WorkList('qa'),
);

board.addWorkers(
  new Worker({ux: 1}),
  new Worker({dev: 1}),
  new Worker({qa: 1}),
);

board.addWorkItems(...generateWorkItems(() => ({
    ux: randomBetween(0,2),
    dev: randomBetween(0,4),
    qa: randomBetween(0,3),
  }), 200
));

new LimitBoardWip(10); // <= new code
```
Results:
- Throughput: about 0.45 stories/day
- Lead time: about 20 days (*massive* improvement)

So without any extra cost, our throughput (velocity) was unaffected, while our lead time went from 100 days to 20 days.

#### Improve even more
``` javascript
// ...the previous code remains the same
new LimitBoardWip(4);
```
Results:
- Throughput: about 0.45 stories/day
- Lead time: about 8.5 days

Again, velocity is unaffected, lead time improved a lot

#### But you can go too far
``` javascript
// ...the previous code remains the same
new LimitBoardWip(2);
```
Results:
- Throughput: about 0.35 stories/day
- Lead time: about 5.5 days

Now we start to see a drop in throughput. This means we went too far in limiting WIP.

#### The best solution: full stack developers
``` javascript
let board = new Board(
  new WorkList('ux'),
  new WorkList('dev'),
  new WorkList('qa'),
);

board.addWorkers(
  new Worker({all: 1}), // <= look ma, a full-stack developer
  new Worker({all: 1}), // <= look ma, a full-stack developer
  new Worker({all: 1}), // <= look ma, a full-stack developer
);

board.addWorkItems(...generateWorkItems(() => ({
    ux: randomBetween(0,2),
    dev: randomBetween(0,4),
    qa: randomBetween(0,3),
  }), 200
));
```
Results:
- Throughput: about 0.6 stories/day
- Lead time: less than 5 days

This is the *ideal* situation, and will probably never be reached. Notice how the WIP is limited naturally by the number of team members.

### Conclusion
The ideal situation is having a team of only full-stack developers. You will probably never reach this state. However, you can still aim for this state by introducing WIP limits.

When a WIP limit has been reached, try to encourage [swarming](https://blog.crisp.se/2009/06/26/henrikkniberg). Team members will then learn new skills and evolve to the ideal state.

## Roadmap
This project is written in a RDD fashion: Readme Driven Development. This means that this readme is the only feature tracking tool I'm using.

### Todo

I welcome suggestions, especially if they come in the form of a pull request.

- Introduce quality, rework, bugs, collaboration, learning, ...
- Introduce [swarming](https://blog.crisp.se/2009/06/26/henrikkniberg).
- Introduce pairing
- Introduce #mobprogramming
- Compare 2 simulations

### Done

- Make a working board
- Have a skill set per developer
- Randomize workload per story
- Randomize skill level for each developer
- Add a graph for lead times, throughput and WIP
- Introduce WIP limits
- Add stats for workers
- Allow multiple developers with the same skill set
