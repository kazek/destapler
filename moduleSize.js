const fs = require('fs');

const getDirectorySize = path => new Promise((resolve, reject) => {
  fs.readdir(path, (err, list) => {
    if (err) reject(err);
    Promise.all(
      list
        .filter(file => (file !== 'node_modules'))
        .map(file => getFileSize(`${path}/${file}`))
    ).then(sizes => resolve(sizes.reduce((sum, size) => sum + size, 0)))
      .catch(reject);
  });
});

const getFileSize = path => new Promise((resolve, reject) => {
  fs.stat(path, (err, data) => {
    if (err) reject(err);
    if (!data) resolve(0);
    if (data.isDirectory()) {
      getDirectorySize(path).then(size => resolve(size));
    } else {
      resolve(data.size);
    }
  });
});

module.exports = module => Promise.all(
    [getFileSize(module.path), ...module.dependencies.map(path => (path && getFileSize(path)))]
  ).then(sizes => sizes.reduce((sum, size) => sum + size, 0));
