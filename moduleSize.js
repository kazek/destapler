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

const calculateDependenciesSizes = module => Promise.all(
  module.dependencies.map(path => (path && getFileSize(path).then(fullSize => ({ path, fullSize }))))
);

const checkSharedDependencies = flatDependenciesTree => flatDependenciesTree
  .map(d => d.dependencies)
  .reduce((depArray, depList) => [...depArray, ...depList], [])
  .reduce((result, path) => {
    const currentValue = (result[path] || 0) + 1;
    return {
      ...result,
      [path]: currentValue
    };
  }, {});

module.exports = (flatDependenciesTree) => {
  const sharedDependencies = checkSharedDependencies(flatDependenciesTree);

  return Promise.all(
    flatDependenciesTree
      .map(module => calculateDependenciesSizes(module)
        .then(sizes => sizes)
        .then(sizes => ({
          ...module,
          fullSize: sizes.reduce((sum, item) => sum + item.fullSize, 0),
          sharedSize: sizes.reduce((sum, item) => (sum + parseInt(item.fullSize / sharedDependencies[item.path], 10)), 0),
          ownSize: sizes.reduce((sum, item) => (sum + (sharedDependencies[item.path] > 1 ? 0 : item.fullSize)), 0)
        }))
        .then(mod => getFileSize(mod.path).then(moduleSize => ({
          ...mod,
          fullSize: mod.fullSize + moduleSize,
          sharedSize: mod.sharedSize + moduleSize,
          ownSize: mod.ownSize + moduleSize
        }))))
  );
};
