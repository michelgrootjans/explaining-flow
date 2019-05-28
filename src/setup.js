require('./animation').initialize();
const {Worker, WorkItem, WorkList, Backlog, DoneList} = require('./worker');

let backlog = new Backlog();
let dev = new WorkList('development');
let readyForReview = new WorkList('-');
let review = new WorkList('review');
// let readyForQA = new WorkList('-');
// let qa = new WorkList('QA');
let prod = new DoneList();

function generateTaskDuration(duration) {
  return Math.floor((Math.random() * duration) + 1);;
}

for (let i = 0; i < 100; i++) {
  backlog.add(new WorkItem(generateTaskDuration(2000)));
}

setTimeout(() => {
  new Worker(backlog, dev, readyForReview, 1).work();
  new Worker(readyForReview, review, prod, 0.9).work();
  // new Worker(readyForQA, qa, prod, 0.8).work();
}, 1000);
