const {
  getFlatDependenciesTree,
} = require('./dependenciesTree');

const calculateModuleSize = require('./moduleSize');

const findInDirectory = require('./find');


const countImports = () => findInDirectory(/require\([\`\'\"].[^\.\/]..*\)/i, process.cwd())
  .map(l => {
    const m = l.match(/require\([\`\'\"]{1}([^\`\'\"\/]*)/i);
    return m && m[1];
  }).reduce((result, name) => {
    if (result[name]) {
      result[name]++;
    } else {
      result[name] = 1;
    }
    return result;
  }, {});
  

module.exports = () => {
  Promise.all(
    getFlatDependenciesTree()
      .map(n => calculateModuleSize(n)
      .then(size => ({...n, size : size})))
  )
    .then((treeWithSizes) => {
      const numberOfImports = countImports();
      console.log(treeWithSizes.map(a => ({
        name: a.name,
        size: a.size,
        imports: numberOfImports[a.name] || 0
      })));
  });
}
