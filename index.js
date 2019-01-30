const {
  getFlatDependenciesTree,
} = require('./dependenciesTree');

const calculateModulesSizes = require('./moduleSize');

const findInDirectory = require('./find');

const package = require('./package.json');

const setEmotion = (weight) => {
  if (weight > 0.8) return '😱';
  if (weight > 0.7) return '😨';
  if (weight > 0.6) return '😬';
  if (weight > 0.5) return '😕';
  if (weight > 0.3) return '😐';
  if (weight > 0.1) return '🙂';
  return '😊';
}

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
  let action;
  let sizeType;

  switch (process.argv[2]) {
    case 'fast':
    case undefined:
      action = 'run';
      sizeType = 'ownSize';
      break;
    case 'slow':
      action = 'run';
      sizeType = 'sharedSize';
      break;
    case 'full':
      action = 'run';
      sizeType = 'fullSize';
      break;
    default:
      action = 'help';
  }

  if(action === 'help') {
    return console.info(`
      ${package.name} version ${package.version}

      [OPTIONS]
        fast    calculates results optimized for short term work
        slow    calculates results optimized for long term work
        full    calculates results based on size of dependency
        help    shows this information
    `)
  }


  calculateModulesSizes(getFlatDependenciesTree()).then((treeWithSizes) => {
    const numberOfImports = countImports();
    const maxSize = Math.max(...treeWithSizes.map(a => a[sizeType]));
    let result = treeWithSizes.map(a => {
      const imports = numberOfImports[a.name] || 0;
      const size = a[sizeType];
      const weight = (imports ? size / imports : size * 2) / maxSize;
      const emotion = setEmotion(weight)

      return {
        name: a.name,
        sharedSize: a.sharedSize,
        fullSize: a.fullSize,
        ownSize: a.ownSize,
        imports,
        weight,
        emotion
      }
    });
    
    result.sort((a, b) => b.weight - a.weight);
    
    console.log(
      result.map(a => ({emotion: a.emotion, size: a[sizeType], name: a.name}))
    );
  });
}
