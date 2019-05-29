require('./animation').initialize();
const {Worker, WorkItem, WorkList, Backlog, DoneList} = require('./worker');

let backlog = new Backlog();
// let ux = new WorkList('ux');
// let readyForDev = new WorkList('-');
let dev = new WorkList('dev');
// let readyForQA = new WorkList('-');
// let qa = new WorkList('qa');
let prod = new DoneList();

function generateTaskDuration(duration) {
  return Math.floor((Math.random() * duration) + 1);
}

for (let i = 0; i < 100; i++) {
  backlog.add(new WorkItem(generateTaskDuration(1000)));
}

setTimeout(() => {
  // new Worker(backlog, ux, prod).work();
  new Worker(backlog, dev, prod).work();
  // new Worker(readyForQA, qa, prod).work();
}, 1000);
