const modulePrefix = "module:"

export default config => {

  const modules = []

  const getModuleName = (babelModule, type) => {
    if (Array.isArray(babelModule)) {
      babelModule = babelModule[0]
    }
    if (babelModule.startsWith(modulePrefix)) {
      return babelModule.substring(modulePrefix.length)
    }
    if (babelModule.startsWith("@")) {
      //const [input, scope, moduleName] = babelModule.match(/@(.*)\/(.*)/)
      //return `@${scope}/${type}-${moduleName}`
      return babelModule
    }
    return `babel-${type}-${babelModule}`
  }

  const extractModulesFromArray = (entries, type) => {
    for (const entry of entries) {
      modules.push(getModuleName(entry, type))
    }
  }

  const extractModulesFromScope = scope => {
    if (scope.presets) {
      extractModulesFromArray(scope.presets, "preset")
    }
    if (scope.plugins) {
      extractModulesFromArray(scope.plugins, "plugin")
    }
    if (scope.env) {
      for (const envConfig of Object.values(scope.env)) {
        extractModulesFromScope(envConfig)
      }
    }
  }

  extractModulesFromScope(config)
  return modules

}