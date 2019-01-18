const {
  getFlatDependenciesTree,
} = require('./dependenciesTree');

module.exports = () => {
  const depTree = getFlatDependenciesTree();
  console.log(depTree);
}
