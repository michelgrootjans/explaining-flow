const PubSub = require('pubsub-js');
const TimeAdjustments = require('./timeAdjustments');

let workerCounter = 1;

function SimpleSkillStrategy(skills) {
  function workSpeedFor({ skill }) {
    return skills[skill] || skills['all'] || skills['rest'] || skills['fs'] || skills['fullstack'];
  }

  function renderName() {
    function renderSkills() {
      return Object.keys(skills).map(skill => `${skill}`)
    }

    return `${renderSkills()}`;
  }

  return {
    workSpeedFor,
    renderName
  };
}

function Worker(skills = {dev: 1}) {
  let idle = true;
  const id = workerCounter++;
  const strategy = new SimpleSkillStrategy(skills);

  function canWorkOn(workCriteria) {
    if (!idle) return 0;
    return strategy.workSpeedFor(workCriteria);
  }

  let worker = {
    canWorkOn,
    startWorkingOn,
    name: strategy.renderName,
    id
  };

  function calculateTimeoutFor(workCriteria) {
    const { item, skill } = workCriteria;
    return 1000 * TimeAdjustments.multiplicator() * item.work[skill] / strategy.workSpeedFor(workCriteria);
  }

  function startWorkingOn({ inbox, inProgress, outbox, item }) {
    if (item) {
      idle = false;
      PubSub.publish('worker.working', worker);
      let skill = inProgress.necessarySkill;
      inbox.move(inProgress, item);
      const workCriteria = { item, skill };
      let timeout = calculateTimeoutFor(workCriteria);
      setTimeout(() => {
        idle = true;
        inProgress.move(outbox, item);
        PubSub.publish('worker.idle', worker);
      }, timeout)
    }
  }

  PubSub.publish('worker.created', worker);
  return worker
}

let workItemCounter = 1;

function WorkItem(work) {
  return {
    id: workItemCounter++,
    work
  };
}

let workListCounter = 1;

function WorkList(skill = "dev") {
  let work = [];
  let id = workListCounter++;

  const size = () => work.length;

  let column = {
    size,
    hasWork: () => size() > 0,
    items: () => work.map(w => w),
    peek: () => work[0],
    add,
    move,
    name: skill,
    id,
    necessarySkill: skill
  };

  function add(item) {
    work.push(item);
    PubSub.publish('workitem.added', {item, column});
  }

  function _remove(item) {
    for (let i = 0; i < size(); i++) {
      if (work[i] === item) {
        work.splice(i, 1);
      }
    }
    PubSub.publish('workitem.removed', {item, column});
  }

  function move(to, item) {
    _remove(item);
    to.add(item);
    return item;
  }

  return column;
}

module.exports = {Worker, WorkItem, WorkList};
