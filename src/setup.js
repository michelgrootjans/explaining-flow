const PubSub = require('pubsub-js');
const scenarios = require('./scenarios')
const Animation = require('./animation');
const {LimitBoardWip} = require('../src/strategies');
const TimeAdjustments = require('./timeAdjustments');
const Stats = require('./stats');
const WorkerStats = require('./worker-stats');
const Scenario = require("./scenario");
const LineChart = require("./charts");
const {createElement} = require('./dom-manipulation')

function createScenarioContainer(scenario) {
    let element = createElement({id: `scenario-${scenario.id}`, className: 'scenario'});
    element.append(createElement({className: 'scenario-title', text: scenario.title}))
    element.append(createElement({className: 'throughput'}))
    element.append(createElement({className: 'leadtime'}))
    element.append(createElement({className: 'wip'}))
    element.append(createElement({className: 'workers'}))

    return element
}

document.addEventListener('DOMContentLoaded', () => {
    scenarios.forEach(scenario => {
        let $scenario = createScenarioContainer(scenario);
        $scenario.addEventListener('click', () => run(scenario))
        document.getElementById('scenarios').append($scenario)
    })
});

const wipLimiter = LimitBoardWip();


const CurrentStats = require("./cfd");
const CumulativeFlowDiagram = require("./CumulativeFlowDiagram");

function run(scenario) {
    PubSub.clearAllSubscriptions();
    Animation.initialize(`#scenario-${scenario.id}`);
    Stats.initialize();
    new WorkerStats();

    document.title = scenario.title || 'Flow simulation'
    TimeAdjustments.speedUpBy(scenario.speed || 1);
    wipLimiter.initialize(scenario.wipLimit || scenario.stories.amount)

    const board = Scenario(scenario).run();

    LineChart(document.getElementById('myChart'), 2000)
    // const stats = CurrentStats(board.columns());
    // stats.init();
    // CumulativeFlowDiagram(document.getElementById('myChart'), stats);
}

