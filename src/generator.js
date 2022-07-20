const {WorkItem} = require('./worker');

function generateWorkItems(work, numberOfWorkItems = 100) {
  return [...Array(numberOfWorkItems).keys()]
    .map(() => new WorkItem(work())
    );
}

function randomBetween(min = 0, max = 1) {
  return min + (Math.random() * (max - min));
}

function averageOf(value) {
  let distance = value * 0.8;
  return randomBetween(value - distance, value + distance);
}

function poisson(value) {
  const multiplier = 10;
  const mean = value * multiplier;

  const L = Math.exp(-mean);
  let p = 1.0;
  let k = 0;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return (k-1)/multiplier;
}

module.exports = {generateWorkItems, randomBetween, averageOf, average: averageOf, poisson};
