const fs = require('fs');

const dependencyStack = []; // to handle circural dependencies

const createDependenciesTree = (path = process.cwd()) => {
  const packageJson = require(`${path}/package.json`);
  if (!packageJson.dependencies) return [];

  return Object.keys(packageJson.dependencies)
    .map(name => {
      const packageData = { name };
      const fullPath = `${path}/node_modules/${name}/`;
      const flatPath = `${process.cwd()}/node_modules/${name}/`;
      packageData.path = fs.existsSync(fullPath) && fullPath || fs.existsSync(flatPath) && flatPath || null;
      if (packageData.path) {
        if (!~dependencyStack.indexOf(packageData.path)) {
          dependencyStack.push(packageData.path);
          packageData.dependencies = createDependenciesTree(packageData.path);
          dependencyStack.pop();
        }
      }
      return packageData;
    });
};

const flattenDependencies = dep => {
  const deps = (dep.dependencies || []).map(d => d.path);
  (dep.dependencies || [])
    .forEach(d => deps.push(...flattenDependencies(d)));
  return deps;
};

const getFlatDependenciesTree = () => createDependenciesTree()
  .map(d => ({
    name: d.name,
    path: d.path,
    dependencies: [...new Set(flattenDependencies(d))]
  }));

module.exports = {
  getFlatDependenciesTree
};
