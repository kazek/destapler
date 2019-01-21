const {
  getFlatDependenciesTree,
} = require('./dependenciesTree');

const calculateModuleSize = require('./moduleSize');

const findInDirectory = require('./find');

//console.log(findInDirectory(/require\([^\)]+\)/, process.cwd()));


module.exports = () => {
  Promise.all(
    getFlatDependenciesTree()
      .map(n => calculateModuleSize(n)
      .then(size => ({...n, size : size})))
  )
    .then((treeWithSizes) => {
      console.log(treeWithSizes.map(a => ({name: a.name, size: a.size})));
  });
}
