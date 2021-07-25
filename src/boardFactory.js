const {WorkList} = require("./worker");

function BoardFactory() {
  const createColumns = workColumnNames => {
    const columns = []
    const doneColumn = () => columns[columns.length - 1];

    const workColumns = workColumnNames.map(name => new WorkList(name));
    columns.push(new WorkList('Backlog'));
    for (let i = 0; i < workColumns.length; i++) {
      columns.push(workColumns[i]);
      columns.push(new WorkList('-'));
    }
    doneColumn().name = 'Done';

    for (let i = 0; i < columns.length; i++) {
      if (i % 2 === 0) {
        let queueColumn = columns[i];
        queueColumn.type = 'queue';
        queueColumn.inbox = columns[i - 1];
        queueColumn.workColumn = columns[i + 1];
      } else {
        let workColumn = columns[i];
        workColumn.type = 'work';
        workColumn.inbox = columns[i - 1];
        workColumn.outbox = columns[i + 1];
      }
    }

    return columns;
  };

  return {
    createColumns: createColumns
  };
}

module.exports = BoardFactory