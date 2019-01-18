const {
  createDependenciesTree,
} = require('./dependenciesTree');

module.exports = () => {

  const depTree = createDependenciesTree();
  console.log(depTree);
}
