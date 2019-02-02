const {
  getFlatDependenciesTree,
} = require('./dependenciesTree');

const calculateModulesSizes = require('./moduleSize');

const findInDirectory = require('./find');

const packageJson = require('./package.json');

const setEmotion = weight => {
  if (weight > 0.8) return '😱';
  if (weight > 0.5) return '😨';
  if (weight > 0.4) return '😬';
  if (weight > 0.3) return '😕';
  if (weight > 0.2) return '😐';
  if (weight > 0.1) return '🙂';
  return '😊';
};

const generateBar = dep => {
  const maxWidth = parseInt(process.stdout.columns / 1.5, 10);
  const fullLength = parseInt(dep.weight * maxWidth, 10);
  let barSize = fullLength - dep.name.length;
  barSize = barSize > 0 ? barSize : 0;
  const CLR = '\x1b[0m';

  const bar = `${dep.name}${[...new Array(barSize)].join(' ')}${[...new Array(maxWidth)].join(' ')}|`.substring(0, maxWidth);

  console.log(`${dep.emotion} \x1b[30m\x1b[41m\x1b[4m${[bar.slice(0, fullLength), CLR, bar.slice(fullLength)].join('')}${CLR} ${dep.imports} `);
};

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

  if (action === 'help') {
    return console.info(`
      ${packageJson.name} version ${packageJson.version}

      [OPTIONS]
        fast    calculates results optimized for short term work
        slow    calculates results optimized for long term work
        full    calculates results based on size of dependency
        help    shows this information
    `);
  }


  return calculateModulesSizes(getFlatDependenciesTree()).then((treeWithSizes) => {
    const numberOfImports = countImports();
    const maxSize = Math.max(...treeWithSizes.map(a => a[sizeType]));
    const result = treeWithSizes.map(a => {
      const imports = numberOfImports[a.name] || 0;
      const size = a[sizeType];
      const weight = imports ? ((size / imports) / maxSize) : 1;
      const emotion = setEmotion(weight);

      return {
        name: a.name,
        sharedSize: a.sharedSize,
        fullSize: a.fullSize,
        ownSize: a.ownSize,
        imports,
        weight,
        emotion
      };
    });

    result.sort((a, b) => b.weight - a.weight);
    result.forEach(generateBar);
  });
};
