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

const calculateModuleSize = module => Promise.all(
    [getFileSize(module.path), ...module.dependencies.map(path => (path && getFileSize(path)))]
  ).then(sizes => sizes.reduce((sum, size) => sum + size, 0));

const checkSharedDependencies = flatDependenciesTree => flatDependenciesTree
    .map(d => d.dependencies)
    .reduce((depArray, depList) => [...depArray, ...depList], [])
    .reduce((result, path) => {
      if(result[path]) {
        result[path]++;
      } else {
        result[path] = 1;
      }
      return result;
    }, {});



module.exports = (flatDependenciesTree, mode = 'full') => {
  if(mode !== 'full') {
    const sharedDependencies = checkSharedDependencies(flatDependenciesTree);
  }

  return Promise.all(
    flatDependenciesTree
    .map(n => calculateModuleSize(n)
      .then(size => ({ ...n, size: size })))
  )
}
