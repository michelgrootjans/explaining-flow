const {average} = require("./generator");

const split = value => value.trim().split(",").map(item => item.trim());

function parseInput(rawInput) {
    const title = rawInput.title;
    const workers = split(rawInput.workers);
    const work = parseWorkload(rawInput.workload);
    const wipLimit = rawInput.wipLimit;
    const speed = (workers.length > 2) ? 20 : 1;
    const numberOfStories = (workers.length > 2) ? 200 : 50;
    let input = {
        title,
        workers,
        stories: {
            amount: numberOfStories,
            work
        },
        wipLimit,
        speed
    };
    if (rawInput.random) input.distribution = average
    return input;
}

function parseWorkload(input) {
    return input
        .trim()
        .split(',')
        .map(pair => pair
            .trim()
            .split(":")
        )
        .reduce((work, pair) => {
            work[pair[0].trim()] = parseInt(pair[1].trim());
            return work;
        }, {})
}

module.exports = {
    parseInput,
    parseWorkload
};