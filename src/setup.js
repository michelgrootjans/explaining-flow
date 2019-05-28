require('./animation').initialize();
const {Worker, WorkItem, WorkList} = require('./worker');

let backlog = new WorkList('backlog');
let dev = new WorkList('development');
let readyForReview = new WorkList('-');
let review = new WorkList('review');
let readyForQA = new WorkList('-');
let qa = new WorkList('QA');
let prod = new WorkList('done');

function generateTaskDuration(duration) {
  return Math.floor((Math.random() * duration) + 1);;
}

for (let i = 0; i < 100; i++) {
  backlog.add(new WorkItem(generateTaskDuration(2000)));
}

setTimeout(() => {
  new Worker(backlog, dev, readyForReview).work();
  new Worker(readyForReview, review, readyForQA).work();
  new Worker(readyForQA, qa, prod).work();
}, 1000);
