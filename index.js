const getFlatDependenciesTree = require('./dependenciesTree');

const calculateModulesSizes = require('./moduleSize');

const findInDirectory = require('./find');

const {
  printDepInfo,
  printHelp
} = require('./view');

const countImports = () => findInDirectory(/require\([\`\'\"].[^\.\/]..*\)/i, process.cwd())
  .map(l => {
    const m = l.match(/require\([\`\'\"]{1}([^\`\'\"\/]*)/i);
    return m && m[1];
  }).reduce((result, name) => {
    const currentValue = (result[name] || 0) + 1;
    return {
      ...result,
      [name]: currentValue
    };
  }, {});

module.exports = () => {
  let sizeType;

  switch (process.argv[2]) {
    case 'fast':
    case undefined:
      sizeType = 'ownSize';
      break;
    case 'slow':
      sizeType = 'sharedSize';
      break;
    case 'full':
      sizeType = 'fullSize';
      break;
    default:
      return printHelp();
  }

  return calculateModulesSizes(getFlatDependenciesTree()).then((treeWithSizes) => {
    const numberOfImports = countImports();
    const maxSize = Math.max(...treeWithSizes.map(a => a[sizeType]));
    const result = treeWithSizes.map(a => {
      const imports = numberOfImports[a.name] || 0;
      const size = a[sizeType];
      const weight = imports ? ((size / imports) / maxSize) : 1;

      return {
        name: a.name,
        sharedSize: a.sharedSize,
        fullSize: a.fullSize,
        ownSize: a.ownSize,
        imports,
        weight
      };
    });

    result.sort((a, b) => b.weight - a.weight);
    result.forEach(printDepInfo);
  });
};
