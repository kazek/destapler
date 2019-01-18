const {
  getFlatDependenciesTree,
} = require('./dependenciesTree');

const {
  calculateModuleSize
} = require('./moduleSize');

module.exports = () => {
  const depTree = getFlatDependenciesTree();
  let promises = [];
  depTree.forEach(m => promises.push(calculateModuleSize(m).then(size => m.size = size)));
  Promise.all(promises).then(() => {
    console.log(depTree)
  });
}
