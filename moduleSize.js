const fs = require('fs');

const calculateModuleSize = module => new Promise((resolve, reject) => {
  let getSizePromises = [];
  
  let size = getSizePromises.push(getFileSize(module.path).then(s => size += s));
  
  module.dependencies.reduce((size, path) => {
    path && getSizePromises.push(getFileSize(path).then(s => size += s));
    return size;
  }, 0);
  
  Promise.all(getSizePromises)
    .then(() => resolve(size))
    .catch(e => reject(e));
});

const getDirectorySize = (path) => new Promise((resolve, reject) => {
  fs.readdir(path, (err, list) => {
    if (err) reject(err);
    let promises = [];
    list.forEach(file => (file != 'node_modules') && promises.push(getFileSize(`${path}/${file}`)));
    Promise.all(promises).then(sizes => resolve(sizes.reduce((sum, size) => sum + size, 0)));
  });
});

const getFileSize = (path) => new Promise((resolve, reject) => {
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

module.exports = {
  calculateModuleSize
}
