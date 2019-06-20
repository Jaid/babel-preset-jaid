/** @module babel-preset-jaid */

import path from "path"
import fs from "fs"

import {isEmpty, isObject} from "lodash"
import preventStart from "prevent-start"
import loadJestConfig from "load-jest-config"

import BabelConfigBuilder from "./BabelConfigBuilder"

const debug = require("debug")(_PKG_NAME)

/**
 * @typedef options
 * @type {object}
 * @property {boolean} [react=false] If `true` or typeof `string`, `react`-related plugins and presets are included. If `react-dom`, `react-dom`-related plugins and presets are also included.
 * @property {boolean} [runtime=true] If `true`, `@babel/plugin-transform-runtime` will be applied.
 * @property {boolean|object} [minify=true] If `false`, `babel-minify` won't be applied to production builds. If `true`, `babel-minify` will be applied with `{removeConsole: true, removeDebugger: true}` as configuration. If typeof `object`, this will be used as `babel-minify` config.
 * @property {null|object} [envOptions=null] If typeof `object`, this will be used as options for `@babel/preset-env`.
 * @property {boolean} [flow=false] If `true`, support Facebook Flow.
 * @property {boolean} [typescript=false] If `true`, support Microsoft TypeScript.
 * @property {boolean} [aotLoader=true] If `true`, `aot-loader/babel` will be applied
 */

/**
 * @function default
 * @param {object} api Babel api instance
 * @param {options} options
 */
export default (api, options) => {
  options = {
    react: false,
    minify: true,
    runtime: true,
    envOptions: null,
    flow: false,
    typescript: false,
    aotLoader: true,
    ...options,
  }

  api.assertVersion("^7.2")

  const configBuilder = new BabelConfigBuilder(api)

  const cacheFactors = [api.version, api.env(), JSON.stringify(options), _PKG_VERSION]

  if (configBuilder.pkg) {
    const packageFileStats = fs.statSync(configBuilder.pkgPath)
    cacheFactors.push(configBuilder.pkgPath)
    cacheFactors.push(Number(packageFileStats.mtime))
    debug(`Loaded ${configBuilder.pkgPath}`)
  } else {
    cacheFactors.push(0)
    cacheFactors.push(0)
  }

  const cacheIdentifier = cacheFactors.join("|")
  debug(`Cache identifier: ${cacheIdentifier}`)
  api.cache.using(() => cacheIdentifier)

  const alias = {}

  const {jestConfigPath, jestConfig} = loadJestConfig({cwd: configBuilder.cwd})
  if (jestConfig?.moduleNameMapper) {
    debug("Found Jest config in %s", jestConfigPath)
    for (const [from, to] of Object.entries(jestConfig.moduleNameMapper)) {
      if (/^\^\w/i.test(from)) {
        const fromResolved = preventStart(from, "^")
        const toResolved = path.resolve(to.replace("<rootDir>", configBuilder.cwd))
        alias[fromResolved] = toResolved
        debug("Registered alias: %s -> %s", fromResolved, toResolved)
      } else {
        debug("Skipping alias: %s -> %s", from, to)
      }
    }
  }

  configBuilder.plugin("macros")
  configBuilder.plugin("@babel/plugin-proposal-decorators", {
    legacy: true,
  })
  if (options.aotLoader) {
    configBuilder.plugin("aot-loader/babel")
  }
  configBuilder.plugin("@babel/plugin-proposal-class-properties")
  configBuilder.plugin("@babel/plugin-proposal-do-expressions")
  configBuilder.plugin("@babel/plugin-proposal-pipeline-operator", {
    proposal: "smart",
  })
  configBuilder.plugin("@babel/plugin-proposal-optional-chaining")
  configBuilder.plugin("@babel/plugin-syntax-dynamic-import")

  configBuilder.pluginForEnvsBut("production", "captains-log")

  if (options.typescript) {
    configBuilder.preset("@babel/preset-typescript")
    if (!options.minify) {
      configBuilder.config.retainLines = true
    }
  }

  if (options.flow) {
    configBuilder.preset("@babel/preset-flow")
    configBuilder.config.retainLines = true
  }

  if (options.react) {
    configBuilder.preset("@babel/preset-react", {
      development: !api.env("production"),
    })
    configBuilder.pluginForEnv("production", "transform-react-class-to-function")
    configBuilder.pluginForEnv("production", "transform-react-remove-prop-types")
    configBuilder.pluginForEnv("production", "@babel/plugin-transform-react-inline-elements")
  }

  if (options.runtime) {
    configBuilder.plugin("@babel/plugin-transform-runtime")
  }

  if (options.react === "react-dom") {
    configBuilder.pluginForEnv("development", "react-hot-loader/babel")
  }

  if (options.minify) {
    const defaultMinifyOptions = {
      removeConsole: true,
      removeDebugger: true,
    }
    const minifyOptions = options.minify |> isObject ? {
      ...defaultMinifyOptions,
      ...options.minify,
    } : defaultMinifyOptions
    debug("Using minify options: %o", minifyOptions)
    configBuilder.presetForEnv("production", "minify", minifyOptions)
  } else {
    debug("Skipping minification")
  }

  configBuilder.pluginForEnv("production", "transform-imports")
  configBuilder.pluginForEnv("production", "lodash")
  configBuilder.pluginForEnv("production", "module:faster.js")
  configBuilder.pluginForEnv("production", "tailcall-optimization")

  if (!isEmpty(alias)) {
    configBuilder.plugin("module-resolver", {
      alias,
      cwd: configBuilder.cwd,
    })
  }

  configBuilder.plugin("pkg", {
    cwd: configBuilder.cwd,
  })

  if (api.env("test")) {
    configBuilder.presetForDependency("ava", "@ava/babel-preset-transform-test-files")
  }

  configBuilder.preset("@babel/preset-env", options.envOptions)

  debug("Final config: %j", configBuilder.config)

  return configBuilder.config
}