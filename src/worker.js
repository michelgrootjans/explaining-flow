const {publish} = require('./publish-subscribe')
const TimeAdjustments = require('./timeAdjustments');
const {anyCardColor} = require("./Colors");

let workerCounter = 1;

function Worker(skills = {dev: 1}) {
  let idle = true;
  const id = workerCounter++;

  function canWorkOn(skill) {
    if (!idle) return 0;
    return workSpeedFor(skill);
  }

  let worker = {
    canWorkOn,
    startWorkingOn,
    name: renderName,
    id
  };

  function renderName() {
    function renderSkills() {
      return Object.keys(skills).map(skill => `${skill}`)
    }

    return `${renderSkills()}`;
  }

  function workSpeedFor(skill) {
    return skills[skill] || skills['all'] || skills['rest'] || skills['fs'] || skills['fullstack'];
  }

  function calculateTimeoutFor(workItem, skill) {
    return 1000 * TimeAdjustments.multiplicator() * workItem.work[skill] / workSpeedFor(skill);
  }

  function startWorkingOn(inbox, inProgress, outbox) {
    let item = inbox.peek();
    if (item) {
      idle = false;
      publish('worker.working', {worker});
      let skill = inProgress.necessarySkill;
      inbox.move(inProgress, item);
      let timeout = calculateTimeoutFor(item, skill);
      setTimeout(() => {
        idle = true;
        inProgress.move(outbox, item);
        publish('worker.idle', {worker});
      }, timeout)
    }
  }

  publish('worker.created', {worker});
  return worker
}

let workItemCounter = 1;

function WorkItem(work) {
  return {
    id: workItemCounter++,
    work,
    color: anyCardColor()
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
    publish('workitem.added', {item, column});
  }

  function _remove(item) {
    for (let i = 0; i < size(); i++) {
      if (work[i] === item) {
        work.splice(i, 1);
      }
    }
    publish('workitem.removed', {item, column});
  }

  function move(to, item) {
    _remove(item);
    to.add(item);
    return item;
  }

  return column;
}

module.exports = {Worker, WorkItem, WorkList};
