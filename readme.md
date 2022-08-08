# Kanban simulator
With this project, you can simulate team structure and see the effect on your team's efficiency and effectiveness.

The measurements you get for each simulation are:
- Throughput: the number of stories the team finishes per unit of time. Typically referred to as team velocity.
- Lead time: the average time taken from start to finish for a story 
- WIP: the number of items in progress, started, but not done

Stakeholders and customers typically worry about throughput and lead time. Throughput indicates how efficient a team is. Lead time indicates how long stakeholders have to wait for their ideas to be implemented.

## Using the simulator
You can use the [online simulator](https://michelgrootjans.github.io/explaining-flow/)

...or you can install it locally to fiddle with it:
```shell
git clone git@github.com:michelgrootjans/explaining-flow.git
cd explaining-flow
npm install
npm run bundle
open index.html
```

## My lightning talk
I'd like to share a few simulations showing the effects of team flow.
These simulations show the different scenarios I run to illustrate the need to understand team flow.

During this lightning talk, I will leave the _#stories_ on automatic.

The stats we're interested in are:
- **Throughput**: this is what is typically measured under the name _velocity_. It's the number of user stories finished per unit of time.
- **Lead time**: the time taken for each story from the moment it has been taken out of the _todo_ column until it reaches the _done_ column.
- **WIP**: Work In Progress. The amount of user stories _in flight_. These stories have been started but are not done yet.
 ### A single developer working on a predictable backlog
In this predictable scenario, a single developer works on 50 stories. Each story takes exactly 1 day to complete. So we expect a throughput of `1` story per day. We expect a lead time of `1` since each story will be in progress for exactly 1 day. This means that we'll have an average of `1` story in progress at any given time.

**Input**
- Work per story: `dev: 1`
- Workers: `dev`

**Expected Results**
  - Throughput: **1 story/day**
  - Lead time: **1 day per story**
  - WIP: **1 story**

### A single developer working on a backlog with some randomness
The developer now spends 1 day _on average_ for each story.
This slight change shows that throughput and lead time move in opposite directions.
This is a direct illustration of [Little's law](https://en.wikipedia.org/wiki/Little%27s_law) which states that in a stable system, `throughput * lead time = WIP`. This formula will be applicable to all the simulations.

**Input**
- Work per story: `dev: 1`
- Workers: `dev`
- Variable work: ☑️

**Expected Results**
- Throughput: **1 story/day**
- Lead time: **1 day per story**
- WIP: **1 story**

### Handover from development to QA
Now both development and qa will spend 1 day _on average_ for each story.

We expect the lead time be 2 on average now: 1 day of development, 1 day of qa. We also expect a Throughput of 1 story per day.

However, if the simulation runs for long enough, a queue will start to appear between dev and qa, adding to the lead time of the stories waiting in the queue.
The reason is simple: As long as qa works faster than dev, everything will run smoothly. Once development starts going faster than qa, its output will wait in the queue.

**Input**
- Work per story: **dev: 1, qa: 1**
- Workers: **dev, qa**
- Variable work: ☑️

**Example Results**
- Throughput: **0.85 stories/day**
- Lead time: **3 days per story**
- WIP: **about 2-3with peaks up to 5**

### Adding UX to the process
Let's accelerate the simulation. This allows us to see patterns we wouldn't recognise in the slow daily movements of stories on a board. From now on, we'll simulate with 200 user stories.

Ux, development and qa will each spend 2 days _on average_ for each story. So each story will have 6 days of work on average (2 ux + 2 dev + 2 qa).

**Input**
- Work per story: **ux: 2, dev: 2, qa: 2**
- Workers: **ux, dev, qa**
- Variable work: ☑️

**Example Results**
- Throughput: **0.45 stories/day**
- Lead time: **20 days per story**
- WIP: **9 stories with peaks of 16**

### Let's stack the deck to make development the slowest in the process
We're now going to shift the effort a little.The total amount of work for each story is still 6, but the distribution is now:
- **1** day of ux on average
- **3** days of dev on average
- **2** days of qa on average

The ideal lead time is still 6 days (1 + 3 + 2). 

Predictably, a big queue will appear in front of the dev column as dev has three times as much work as ux. The average velocity will go down significantly, and the lead time will start to skyrocket.

**Input**
- Work per story: **ux: 1, dev: 3, qa: 2**
- Workers: `ux, dev, qa`
- Variable work: ☑️

**Example Results**
- Throughput: **0.30 stories/day**
- Lead time: **200 days per story**
- WIP: **about 60 with a peak of 120**

This is bad. The low velocity and high lead time will make customers very unhappy. Let me remind you that each work item takes 6 days of work on average. Because they wait in a queue for most of their lifecycle, it takes 200 days on average to go from start to finish. This is one of the reasons why the amount of work for a task has no correlation to when it will be finished.

How can we change team structure to improve this?

### Let's add an extra developer
The usual reflex at this point is to add developers to speed things up. This will obviously raise the daily cost of the team. What would be the expected benefit? Twice the throughput? Let's try that out in the next simulation.

**Input**
- Work per story: `ux: 1, dev: 3, qa: 2`
- Workers: ux, **dev, dev**, qa
- Variable work: ☑️

**Example Results**
- Throughput: **0.45 stories/day**
- Lead time: **100 days per story**
- WIP: **about 50 with a peak of 100**

We have an improvement in throughput, but it's not the doubling we expected. Lead time halved, but is still disastrous.

### Let's add yet an extra developer
Since adding a developer improved matters, let's try by adding yet another developer

**Input**
- Work per story: **`ux: 1, dev: 3, qa: 2`**
- Workers: ux, **dev, dev, dev**, qa
- Variable work: ☑️

**Example Results**
- Throughput: **0.45 stories/day**
- Lead time: **100 days per story**
- WIP: **about 50 with a peak of 100**

Adding an extra developer had absolutely no effect on throughput or lead time. This was obviously a bad strategy

### Let's go back to the original team of 3 and introduce a WIP-limit instead
We will simulate with the same team from scenario 5, but introduce a WIP-limit of 10. This means that no-one is allowed to start a new story as long as there are 10 stories _in flight_.

**Input**
- Work per story: **`ux: 1, dev: 3, qa: 2`**
- Workers: `ux, dev, qa`
- WIP-limit: **10**
- Variable work: ☑️

**Example Results**
- Throughput: **0.30 stories/day**
- Lead time: **30 days per story**
- WIP: **10 stories**

With no extra cost, our throughput was unaffected, while our lead time went from 200 days to 30 days.

### Improve even more
Since limiting WIP works so well, why not limiting it to 5?

**Input**
- Work per story: **`ux: 1, dev: 3, qa: 2`**
- Workers: `ux, dev, qa`
- WIP-limit: **5**
- Variable work: ☑️

**Example Results**
- Throughput: **0.30 stories/day**
- Lead time: **15 days per story**
- WIP: **5 stories**

Again, with no extra cost, our throughput was unaffected, while our lead time halved yet again.

### But you can go too far
Let's try limiting WIP to 2 now.

**Input**
- Work per story: **`ux: 1, dev: 3, qa: 2`**
- Workers: `ux, dev, qa`
- WIP-limit: **2**
- Variable work: ☑️

**Example Results**
- Throughput: **0.25 stories/day**
- Lead time: **7 days per story**
- WIP: **2 stories**

Now we start to see a drop in throughput. This might be a good tradeoff depending on your situation. If you care more about rapid feedback than feature delivery speed, you might choose this configuration.

If you prefer a higher throughput with longer feedback cycles, you went too far in limiting WIP.

### Introducing multidisciplinary team members
Now that we control our lead time, is there anything we could do to improve the throughput while keeping lead time low? Let's introduce a tester that can also develop.

**Input**
- Work per story: **`ux: 1, dev: 3, qa: 2`**
- Workers: ux, dev, **qa+dev**
- WIP-limit: `5`
- Variable work: ☑️

**Example Results**
- Throughput: **0.38 stories/day**
- Lead time: **15 days per story**
- WIP: **5 stories**

Now the throughput is higher. A throughput improvement from `0.30` to `0.38` means we finished our project of 200 work items in about 530 days instead of about 640 days.

### The best solution: full stack developers
**Input**
- Work per story: **`ux: 1, dev: 3, qa: 2`**
- Workers: `fullstack, fullstack, fullstack`
- WIP-limit: ``
- Variable work: ☑️

**Example Results**
- Throughput: **0.47 stories/day**
- Lead time: **6.2 days per story**
- WIP: **3 stories**

The throughput is approximatively the same as scenario 6, without the cost of the extra developer. The lead time is now very close to the ideal 6.

This is the *ideal* situation, and will probably never be reached. Notice how the WIP is limited naturally by the number of team members.

### Conclusion
First: notice that [Little's law](https://en.wikipedia.org/wiki/Little%27s_law) applies to every scenario we saw:
`throughput * lead time = WIP` on average values.

The ideal situation is having a team of only full-stack developers. You will probably never reach this state. However, you can still aim for this state:

Start by introducing WIP limits. When the WIP limit has been reached, some team members will have nothing to do. Try to encourage [swarming](https://blog.crisp.se/2009/06/26/henrikkniberg). Team members will then learn new skills and evolve towards becoming full-stack developer. This will in turn improve the total throughput and lead time.

## Other experiments to try:
Experiment with some hybrid setups, and think about why some of these are better than others. For example, which worker setup do you expect to be better: `fullstack, dev, qa`, `ux, fullstack, qa` or `ux, dev, fullstack`? Verify your assumptions by running the simulation.


You could try to add architecture, analysis, deveops, ... I'm sure you'll quickly realize that the more handovers you introduce, the less effective the setup will become.

## Roadmap
This project is written in a RDD fashion: Readme Driven Development. This means that this readme is the only feature tracking tool I'm using.

### Todo

I welcome suggestions, especially if they come in the form of a pull request.
- Introduce a cumulative flow diagram
- Introduce quality, rework, bugs, collaboration, learning, ...
- Introduce [swarming](https://blog.crisp.se/2009/06/26/henrikkniberg)
- Introduce pairing
- Introduce #mobprogramming
- Introduce epics: one big epic goes through architecture and analysis, then generates a bunch of smaller stories

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

# License
Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg
