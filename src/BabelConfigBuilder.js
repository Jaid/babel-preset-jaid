import {sync as readPkgUp} from "read-pkg-up"

export default class BabelConfigBuilder {

  constructor(babelApi, cwd = process.cwd()) {
    this.config = {
      presets: [],
      plugins: [],
    }
    this.babelApi = babelApi
    this.cwd = cwd
    const packageJson = readPkgUp(cwd)
    if (packageJson?.pkg) {
      this.pkg = packageJson.pkg
      this.pkgPath = packageJson.path
      this.pkgDependencies = Object.keys({
        ...this.pkg.dependencies,
        ...this.pkg.peerDependencies,
        ...this.pkg.optionalDependencies,
        ...this.pkg.devDependencies,
      })
    }
  }

  plugin(name, pluginOptions) {
    this.config.plugins.push(pluginOptions ? [name, pluginOptions] : name)
  }

  pluginForEnv(envTest, ...args) {
    if (this.babelApi.env(envTest)) {
      this.plugin(...args)
    }
  }

  pluginForEnvsBut(envTest, ...args) {
    if (!this.babelApi.env(envTest)) {
      this.plugin(...args)
    }
  }

  pluginForDependency(dependency, ...args) {
    if (this.pkgDependencies?.includes(dependency)) {
      this.plugin(...args)
    }
  }

  preset(name, presetOptions) {
    this.config.presets.push(presetOptions ? [name, presetOptions] : name)
  }

  presetForEnv(envTest, ...args) {
    if (this.babelApi.env(envTest)) {
      this.preset(...args)
    }
  }

  presetForEnvsBut(envTest, ...args) {
    if (!this.babelApi.env(envTest)) {
      this.preset(...args)
    }
  }

  presetForDependency(dependency, ...args) {
    if (this.pkgDependencies?.includes(dependency)) {
      this.preset(...args)
    }
  }

}