const fs = require('fs');

const findInFile = (pattern, file) => {

  let results = [];
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  lines.forEach(function (line) {
    if (!~line.search(pattern)) {
      results.push(line);
    }
  });

  return results;
};
