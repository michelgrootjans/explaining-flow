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

To modify the team structure, look at `src/scenarios.js` and adapt to your wishes. Then `npm run bundle` again to reopen `index.html`

## My lightning talk

The following chapters show the different scenarios I run to illustrate the need to understand flow compared to velocity. These scenarios are ready to be clicked on the page. Each time you click a scenario, it will run and show its stats.
The stats we're interested in are:
- **Throughput**: this is what is typically measured under the name _velocity_. It's the number of user stories finished per unit of time.
- **Lead Time**: the time taken for each story from the moment it has been taken out of the _todo_ column until it reaches the _done_ column.
- **WIP**: Work In Progress. The amount of user stories _in flight_. These stories have been started but are not done yet.

#### scenario 1: a single developer working on a predictable backlog
A single developer finishing one user story per day.

Results:
  - Throughput: about 1 story/day
  - Lead time: about 1 day per story
  - WIP: 1 story

#### scenario 2: a single developer working on a backlog with some randomness
The developer now spends 1 day _on average_ for each story.
This slight change shows that throughput and lead time move in opposite directions.
This is a direct illustration of [Little's law](https://en.wikipedia.org/wiki/Little%27s_law) which states that in a stable system, `throughput * lead time = WIP`.
Stated another way: `lead time = WIP/throughput`.

Results:
- Throughput: about 1 story/day with some variation
- Lead time: about 1 day per story with some variation
- WIP: 1 story

#### scenario 3: handover from development to QA
Now both development and qa will spend 1 day _on average_ for each story.

We expect the Lead Time be 2 on average now: 1 day of development, 1 day of qa. We also expect a Throughput of 1 story per day.

However, if the simulation runs for long enough, a queue will start to appear between dev and qa, adding to the lead time of the stories waiting in the queue.
The reason is simple: As long as qa works faster than dev, everything will run smoothly. Once development starts going faster than qa, its output will wait in the queue.

Results will vary depending on the randomness of the simulation:
- Throughput: a bit lower than 1 story/day
- Lead time: 3 to 4 days per story
- WIP: peaks between 5 and 10

#### scenario 4: adding UX to the process
Let's also accelerate the simulation. This allows us to see patterns we wouldn't recognise in the slow daily movements of stories on a board.

Now ux, development and qa will spend 1 day _on average_ for each story. This is where lead time will start to increase, but it wil barely be visible in the velocity.

Results will vary depending on the randomness of the simulation:
- Throughput: between 0.6-0.8 stories/day
- Lead time: probably more than 10 days per story
- WIP: peaks between 10 and 20

#### scenario 5: let's stack the deck to make development the slowest in the process
From now on, each scenario will distribute the effort unevenly amongst the workers as follows:
- **1** day of ux on average
- **2** days of dev on average
- **1.5** days of qa on average

The ideal lead time will be 4.5 days (1 + 2 + 1.5). You will never be able to go lower than 4.5 days per story. 

Predictably, a big queue will appear in front of the dev column. This is where lead time will start to skyrocket, and it wil barely be visible in the velocity.

Results:
- Throughput: about 0.45 stories/day
- Lead time: about 100 days. We are far away of the ideal 4.5
- WIP will probably peak at around 100

#### scenario 6: let's add an extra developer
This is bad. We have 3 team members with a total velocity 2 times lower that when we had a single developer.

The usual reflex at this point is to add developers to speed things up ;-)

What would be the expected outcome? Twice the throughput? Let's try that out in the next simulation.

Results:
- Throughput: about 0.6 stories/day (slightly improved).
- Lead time: about 50 days (improved with a factor of 2)
- WIP peaks at about 60
- Cost: +1 team member


#### scenario 7: Let's reduce the team again and introduce a WIP-limit instead of a new developer
We will simulate with the same team from scenario 5, but introduce a WIP-limit of 10. This means that noone is allowed to start on a new story for as long as there are 10 stories _in flight_.

Results:
- Throughput: about 0.45 stories/day (no change)
- Lead time: about 20 days, a ***massive*** improvement
- WIP peaks at 10 (duh!)

So without any extra cost, our throughput (velocity) was unaffected, while our lead time went from 100 days to 20 days.

#### scenario 8: Improve even more
Since limiting WIP works so well, why not limiting it to 4?

Results:
- Throughput: about 0.45 stories/day (still no change)
- Lead time: about 8.5 days. Even better than before.
- WIP peaks at 4

#### scenario 9: But you can go too far
Let's try limiting WIP to 2 now.

Results:
- Throughput: about 0.35 stories/day.
- Lead time: about 5.5 days. Even better.
- WIP peaks at 2

Now we start to see a drop in throughput. This means we went too far in limiting WIP. Our bottleneck, development, was not working at 100% anymore, which caused the whole drop in throughput.

#### scenario 10: The best solution: full stack developers
Results:
- Throughput: about 0.6 stories/day. The same as scenario 6, without the cost of the extra developer.
- Lead time: less than 5 days. We're now very close to the ideal 4.5

This is the *ideal* situation, and will probably never be reached. Notice how the WIP is limited naturally by the number of team members.

### Conclusion
The ideal situation is having a team of only full-stack developers. You will probably never reach this state. However, you can still aim for this state by introducing WIP limits. When the WIP limit has been reached, try to encourage [swarming](https://blog.crisp.se/2009/06/26/henrikkniberg). Team members will then learn new skills and evolve towards becoming full-stack developer. This will in turn increase the total throughput.

## Roadmap
This project is written in a RDD fashion: Readme Driven Development. This means that this readme is the only feature tracking tool I'm using.

### Todo

I welcome suggestions, especially if they come in the form of a pull request.
- Introduce a cumulative flow diagram
- Introduce quality, rework, bugs, collaboration, learning, ...
- Introduce [swarming](https://blog.crisp.se/2009/06/26/henrikkniberg).
- Introduce pairing
- Introduce #mobprogramming

### Done
- Make a working board
- Have a skill set per developer
- Randomize workload per story
- Randomize skill level for each developer
- Add a graph for lead times, throughput and WIP
- Introduce WIP limits
- Add stats for workers
- Allow multiple developers with the same skill set
- Compare 2 simulations
