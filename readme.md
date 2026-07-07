# Flow Simulator — team topology experiments you can run

Every argument about team structure eventually collapses into dueling anecdotes: specialists vs. cross-skilled, more people vs. better flow, big batches vs. small. This simulator ends the anecdotes. Configure a team, press Run, and watch the physics — throughput, cycle time, and WIP, measured live while animated work items move across a board.

**Run it here: https://hallmansm.github.io/explaining-flow/** — no install, and it comes pre-loaded with a full experiment series (below).

This is a fork of [Michel Grootjans' explaining-flow](https://github.com/michelgrootjans/explaining-flow), extended for live demos and coaching sessions. His original readme includes an excellent scenario-by-scenario lightning talk that remains the best gentle introduction to the tool's ideas.

## What it measures

- **Throughput** — stories finished per day. What velocity wishes it were.
- **Cycle time** — elapsed days from started to done, per story. The only number your customer feels.
- **WIP** — stories in flight: started, not done.

The three obey [Little's law](https://en.wikipedia.org/wiki/Little%27s_law) (`WIP = throughput × cycle time`) in every scenario — watching that hold while everything else changes is half the education.

## The Banana Software Company experiment series

The Recipe dropdown ships pre-loaded with eleven scenarios. They're a sequence, not a grab bag — pick each one, press Run, and read the walkthrough below as you go. Every scenario exists to answer one question, and the columns accumulate in the stats table so you can compare as you climb.

### 1. Base Team — the org chart everyone starts with

Seven people: a product owner, two UI designers, three developers, one tester. Each story needs all four specialties in order (po → ui → dev → qa), work per story averages po: 2, ui: 4, dev: 8, qa: 2, and nothing limits how much gets started. This is a completely normal, reasonably staffed team — which is the point.

**Watch:** queues pile up between the specialties while everyone stays busy. Cycle time runs far beyond the ~16 days of actual work per story, because most of a story's life is spent waiting for the *next* specialist, not being worked. These are the baseline numbers everything else has to beat.

### 2–4. 2x, 4x, 8x People — buying capacity

The reflexive fix: "we need more people." These three scenarios buy the exact same team again — twice over, four times, eight times. Payroll scales perfectly linearly.

**Watch:** throughput rises, but never by the multiple you paid for — divide throughput by team cost and **throughput-per-expense falls with every hire**. And the queues never leave; they just get bigger absolute numbers flowing into them. Capacity was never the constraint, so buying capacity buys disappointment at scale. This is the strategy the rest of the series competes against.

### 5. WIP throttling only — the first free lever

Back to the original seven people. One change, costing zero dollars: no more than 7 stories may be in flight at once — when the board is full, nobody starts anything new; they finish something instead.

**Watch:** cycle time collapses while throughput barely moves. The work didn't speed up — the *waiting* was cut, because the queue between specialties was self-inflicted inventory. Stop starting, start finishing, priced: free.

### 6. Cross-skilling only — the second free lever

Original seven again, unlimited WIP, but now every person carries **two skills** — and the pairings are *pointed at the work*: dev is half of every story's effort, so four of the seven carry dev (dev+ui, dev+ui, dev+qa, dev+po, ui+po, ui+qa, qa+po). No hires — the same humans, more versatile, aimed where the demand is.

**Watch:** the handoff blocking dissolves. When a story needs a tester and the tester is busy, someone else who *can* test picks it up — work routes to the best available person instead of waiting for the one designated specialist. Idle time converts directly into flow.

**The trap worth knowing:** the pointing is not optional. Deal the same fourteen skill-slots out *without* watching where the work is (dev stuck at 3-of-7 coverage while dev is 50% of the demand) and this lever goes negative — busier than the specialist team and slower, because the scarce dev-capable people keep getting captured by other columns' work. Cross-training that doesn't add capacity at the constraint is a gym membership for the wrong muscle. Try it: rebuild the roster as `po+qa, po+ui, ui+dev, ui+qa, dev+ui, dev+qa, qa+ui` and watch a "free lever" lose to doing nothing.

### 7. Cut Batch only — the third free lever

Original seven, specialists, unlimited WIP — but every story is sliced in half (work per item drops to po: 1, ui: 2, dev: 4, qa: 1, and there are twice as many items for the same total work).

**Watch:** the same amount of work flows noticeably smoother in smaller pieces. Queues form later and drain faster, feedback arrives sooner, and variance hurts less because each individual item risks less. Nothing about the team changed — only the size of the units of work.

### 8–10. The combos — stacking all three levers

Now the levers get combined, and the only thing that climbs from scenario to scenario is **how many skills each person carries**:

- **WIP + cx2 skill + batch** — two-skilled people, WIP capped at 7, stories cut in half
- **WIP + cx3 skill + batch** — three-skilled people, same cap, same small batches
- **WIP + fullstack + batch** — four-skilled people (every skill), same cap, same batches

**Watch:** each rung of the skill ladder raises throughput and tightens cycle time further, because every additional skill per person removes another class of "waiting for the right specialist." Then put the final column next to **2x People**: in typical runs the full combo **matches or beats the double-payroll team on throughput and crushes it on cycle time — with the original seven people.** That comparison is the entire series in one glance: the levers that cost nothing outperform the lever that cost a second payroll.

### 11. Base Team (noVar) — the control

The baseline team once more, but with Variable work switched off: every task takes exactly its average. Compare against scenario 1.

**Watch:** how much better everything runs on *identical averages*. The difference between this and scenario 1 is the pure cost of randomness — queues form under variability even when the arithmetic says they shouldn't, which is why plans built on averages fail. (Goldratt called it dependent events plus statistical fluctuations; your Gantt chart calls it nothing, which is the problem.)

---

Recipes are saved in your browser (localStorage): edit one and re-run under the same name to update it, hit **×** to delete one, name a new configuration to add your own. Clearing them is permanent for your browser — fresh visitors always start with the full set.

## Run it locally

```shell
git clone https://github.com/hallmansm/explaining-flow.git
cd explaining-flow
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## What this fork adds

- **Scenario names** — label runs so five-deep comparisons stay readable
- **Saved recipes** — the dropdown, with update-in-place, delete, and the baked-in demo series
- **A Clear button** — reset runs and charts between audiences, keeping recipes
- **A stable stats frame** — big teams (4x/8x) no longer shove the animation off-screen; the comparison table scrolls in place
- Case-insensitive worker/skill parsing, and assorted demo-hardening fixes

## Companion simulator

This sim has no rework loop — quality is assumed. For the other half of the story, the [Rework Backwash simulator](https://hallmansm.github.io/rework-sim/) shows what a defect rate does to a single team's flow: why 33% rework isn't "33% slower" but a queueing cliff.

## Credits

Concept, model, and the original implementation: [Michel Grootjans](https://github.com/michelgrootjans/explaining-flow). Fork maintained by Steve Hallman ([The Agile Couch](https://theagilecouch.com)), with Claude doing the typing.

# License

Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by],
same as the upstream project it derives from.

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg
