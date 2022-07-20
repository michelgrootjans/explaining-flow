const validateWork = ({workload}) => /^(\s*\w+\s*:\s*\d+\s*)(,\s*\w+\s*:\s*\d+\s*)*$/.test(workload);

const validateWorkers = ({workload, workers}) => {
  const validateWorkersFormat = () => /^(\s*(\w+)(\+\w+)*\s*)(,\s*(\w+)(\+\w+)*\s*)*$/gm.test(workers);

  const validateWorkLoadCanBeExecuted = () => {
    if (workers.includes('fullstack')) return workers;
    if (workers.includes('fs')) return workers;

    const expectedWorkers = workload.split(',')
      .map(worker => worker.split(':')[0].trim());

    return expectedWorkers.every(w => workers.includes(w))
  };

  return validateWorkersFormat() && validateWorkLoadCanBeExecuted();
};

const suggestNumberOfStories = ({workers}) => workers?.split(',').length > 2 ? 200 : 50;

const initialize = () => {
  const $workload = document.getElementById('workload');
  const $workers = document.getElementById('workers');
  const $numberOfStories = document.getElementById('numberOfStories');

  if (!($workload && $workers)) return;

  const values = () => ({workload: $workload.value, workers: $workers.value});

  $workload.addEventListener('blur', () => {
    const input = values();

    if (validateWork(input)) {
      $workload.classList.remove('bg-warning');
    } else {
      $workload.classList.add('bg-warning');
    }
  });

  $workers.addEventListener('blur', () => {
    const input = values();

    if (validateWorkers(input)) {
      $workers.classList.remove('bg-warning');
      $numberOfStories.setAttribute('placeholder', suggestNumberOfStories(input))
    } else {
      $workers.classList.add('bg-warning');
    }
  });

  return {
    isValid: () => {
      const input = values();
      return validateWork(input) && validateWorkers(input);
    },
  }
};

module.exports = {initialize, validateWork, validateWorkers, suggestNumberOfStories}