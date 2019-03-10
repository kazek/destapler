const setEmotion = weight => {
  if (weight > 0.8) return '😱';
  if (weight > 0.5) return '😨';
  if (weight > 0.4) return '😬';
  if (weight > 0.3) return '😕';
  if (weight > 0.2) return '😐';
  if (weight > 0.1) return '🙂';
  return '😊';
};

const pad = (num, size) => {
  let s = `${num}`;
  while (s.length < size) s = ` ${s}`;
  return s;
};

const printDepInfo = dep => {
  const maxWidth = parseInt(process.stdout.columns / 1.5, 10);
  const fullLength = parseInt(dep.weight * maxWidth, 10);
  const emotion = setEmotion(dep.weight);
  const clr = '\x1b[0m';
  const inv = '\x1b[7m';
  const dim = '\x1b[2m';

  const bar = `${dep.name}${[...new Array(maxWidth - dep.name.length)].join(' ')}`;
  console.log(`${clr}${emotion} ${inv}${[bar.slice(0, fullLength), clr, bar.slice(fullLength)].join('')}${dim} ${pad(dep.imports, 3)} ${pad(parseInt(dep.fullSize / 1024, 10), 9)}KB ${pad(parseInt(dep.ownSize / 1024, 10), 9)}KB`);
};

const printHelp = () => {
  const packageJson = require('./package.json');
  return console.info(`
      ${packageJson.name} version ${packageJson.version}

      [OPTIONS]
        fast    calculates results optimized for short term work
        slow    calculates results optimized for long term work
        full    calculates results based on size of dependency
        help    shows this information
    `);
};

module.exports = {
  printDepInfo,
  printHelp
};
