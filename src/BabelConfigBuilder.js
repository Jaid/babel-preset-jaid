import {readPackageUpSync as readPkgUp} from "read-pkg-up"

export default class BabelConfigBuilder {

  /**
   * @constructor
   * @param {object} babelApi
   * @param {string} [cwd]
   */

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

  /**
   * @function
   * @param {string} name
   * @param {object} [pluginOptions]
   */

  plugin(name, pluginOptions) {
    this.config.plugins.push(pluginOptions ? [name, pluginOptions] : name)
  }

  /**
   * @function
   * @param {string} envTest
   * @param {string} name
   * @param {object?} [presetOptions]
   */

  pluginForEnv(envTest, name, presetOptions) {
    if (this.babelApi.env(envTest)) {
      this.plugin(name, presetOptions)
    }
  }

  /**
   * @function
   * @param {string} envTest
   * @param {string} name
   * @param {object?} [presetOptions]
   */

  pluginForEnvsBut(envTest, name, presetOptions) {
    if (!this.babelApi.env(envTest)) {
      this.plugin(name, presetOptions)
    }
  }

  /**
   * @function
   * @param {string} dependency
   * @param {string} name
   * @param {object?} [presetOptions]
   */

  pluginForDependency(dependency, name, presetOptions) {
    if (this.pkgDependencies?.includes(dependency)) {
      this.plugin(name, presetOptions)
    }
  }

  /**
   * @function
   * @param {string} name
   * @param {object?} [presetOptions]
   */

  preset(name, presetOptions) {
    this.config.presets.push(presetOptions ? [name, presetOptions] : name)
  }

  /**
   * @function
   * @param {string} envTest
   * @param {string} name
   * @param {object?} [presetOptions]
   */

  presetForEnv(envTest, name, presetOptions) {
    if (this.babelApi.env(envTest)) {
      this.preset(name, presetOptions)
    }
  }

  /**
   * @function
   * @param {string} envTest
   * @param {string} name
   * @param {object?} [presetOptions]
   */

  presetForEnvsBut(envTest, name, presetOptions) {
    if (!this.babelApi.env(envTest)) {
      this.preset(name, presetOptions)
    }
  }

  /**
   * @function
   * @param {string} dependency
   * @param {string} name
   * @param {object?} [presetOptions]
   */

  presetForDependency(dependency, name, presetOptions) {
    if (this.pkgDependencies?.includes(dependency)) {
      this.preset(name, presetOptions)
    }
  }

}