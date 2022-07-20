const {average, poisson} = require("./generator");

function parseInput(rawInput) {
    const title = rawInput.title;
    const workers = parseWorkers(rawInput.workers);
    const work = parseWorkload(rawInput.workload);
    const wipLimit = rawInput.wipLimit;
    const numberOfStories = parseInt(rawInput.numberOfStories || ((workers.length > 2) ? 200 : 50));
    const speed = (numberOfStories >= 100) ? 20 : 1;
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
    if (rawInput.random) input.distribution = poisson
    return input;
}

function parseWorkers(input) {
    return input
        .split(',')
        .map(skillsInput => ({skills: parseSkills(skillsInput)}));
}

function parseSkills(input) {
    return input
        .split('+')
        .map(skill => skill.trim());
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
    parseWorkload,
    parseWorkers
};
