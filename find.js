const fs = require('fs');

const findInFile = (pattern, path) => fs.readFileSync(path, 'utf8')
  .split('\n')
  .reduce((results, line) => {
    if (~line.search(pattern)) {
      results.push(line);
    }
    return results
  }, []);

 const findInDirectory = (pattern, path, extensions = ['js', 'ts']) => {
  let results = [];
  fs.readdirSync(path).forEach(file => {
    if (file !== 'node_modules') {
      if (fs.statSync(`${path}/${file}`).isDirectory()) {
        results = [...results, ...findInDirectory(pattern, `${path}/${file}`)];
      } else {
        if(~extensions.indexOf(file.split('.').pop())) {
          results = [...results, ...findInFile(pattern, `${path}/${file}`)];
        }
      }
    }
  });
  return results;
}

module.exports = findInDirectory;