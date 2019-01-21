const fs = require('fs');

const findInFile = (pattern, path) => fs.readFileSync(path, 'utf8')
  .split('\n')
  .reduce((results, line) => {
    //console.log('line', line)
    if (~line.search(pattern)) {
      results.push(line);
    }
    return results
  }, []);

 const findInDirectory = (pattern, path) => {
  let results = [];
  fs.readdirSync(path).forEach(file => {
    if (file !== 'node_modules') {
      if (fs.statSync(file).isDirectory()) {
        results = [...results, ...findInDirectory(pattern, file)];
      } else {
        results = [...results, ...findInFile(pattern, file)];
      }
    }
  });
  return results;
}

module.exports = findInDirectory;