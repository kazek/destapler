const {
  getFlatDependenciesTree,
} = require('./dependenciesTree');

const calculateModulesSizes = require('./moduleSize');

const findInDirectory = require('./find');

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
    calculateModulesSizes(getFlatDependenciesTree()).then((treeWithSizes) => {
      const numberOfImports = countImports();
      const maxSize = Math.max(...treeWithSizes.map(a => a.size));
      let result = treeWithSizes.map(a => {
        const imports = numberOfImports[a.name] || 0;
        const weight = (imports ? a.size / imports : a.size * 2) / maxSize;
        const emotion = setEmotion(weight)

        return {
          name: a.name,
          size: a.size,
          imports,
          weight,
          emotion
        }
      });
      
      result.sort((a, b) => b.weight - a.weight);
      
      console.log(
        result.map(a => ({name: a.name, emotion: a.emotion}))
      );
  });
}
