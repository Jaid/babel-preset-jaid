/** @module babel-preset-jaid */

import fsExtra from "fs-extra"
import hasContent from "has-content"
import loadJestConfig from "load-jest-config"
import {isObject} from "lodash"
import path from "path"
import preventStart from "prevent-start"

import BabelConfigBuilder from "./BabelConfigBuilder"

const debug = require("debug")(process.env.REPLACE_PKG_NAME)

/**
 * @typedef {Object} options
 * @prop {boolean|string} [react=false] If `true` or typeof `string`, `react`-related plugins and presets are included. If `react-, `react-dom`-related plugins and presets are also included.
 * @prop {boolean} [runtime=true] If `true`, `@babel/plugin-transform-runtime` will be applied.
 * @prop {boolean|Object} [minify=true] If `false`, `babel-minify` won't be applied to production builds. If `true`, `babel-fy` will be applied with `{removeConsole: false, removeDebugger: true}` as configuration. If typeof `object`, this will bed as `babel-minify` config.
 * @prop {Object} [envOptions=null] If typeof `object`, this will be used as options for `@babel/preset-env`.
 * @prop {boolean} [typescript=false] If `true`, support Microsoft TypeScript.
 * @prop {boolean} [aotLoader=true] If `true`, `aot-loader/babel` will be applied
 * @prop {boolean} [legacyDecorators=true] If `true`, `plugin-proposal-decorators` will have `lecacy: true` and `plugin-proposal-class-properties` will have `loose: true`
 * @prop {boolean} [outputConfig = false] If `true`, the generated Babel config will be written to `./dist/babel-preset-jaid/config.json` (can be also activated with environment variable outputBabelPresetJaid=1)
 * @prop {boolean} [esm = true]
 * @prop {boolean} [loose = false]
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
    runtime: false,
    envOptions: null,
    typescript: false,
    aotLoader: true,
    legacyDecorators: true,
    outputConfig: false,
    esm: false,
    loose: false,
    ...options,
  }

  api.assertVersion("^7.11")

  const configBuilder = new BabelConfigBuilder(api)

  const cacheFactors = [api.version, api.env(), JSON.stringify(options), process.env.REPLACE_PKG_VERSION]

  if (configBuilder.pkg) {
    const packageFileStats = fsExtra.statSync(configBuilder.pkgPath)
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
  if (options.aotLoader) {
    configBuilder.plugin("aot-loader/babel")
  }
  configBuilder.plugin("@babel/plugin-proposal-decorators", {
    decoratorsBeforeExport: options.legacyDecorators ? undefined : true,
    legacy: options.legacyDecorators ? true : undefined,
  })
  configBuilder.plugin("@babel/plugin-proposal-class-properties", {
    loose: options.legacyDecorators ? true : undefined,
  })
  configBuilder.plugin("@babel/plugin-proposal-do-expressions")
  configBuilder.plugin("@babel/plugin-proposal-pipeline-operator", {
    proposal: "smart",
  })
  configBuilder.plugin("@babel/plugin-proposal-optional-chaining")

  if (options.typescript) {
    configBuilder.preset("@babel/preset-typescript")
    if (!options.minify) {
      configBuilder.config.retainLines = true
    }
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
      removeConsole: false,
      removeDebugger: true,
    }
    const minifyOptions = isObject(options.minify) ? {
      ...defaultMinifyOptions,
      ...options.minify,
    } : defaultMinifyOptions
    debug("Using minify options: %o", minifyOptions)
    configBuilder.presetForEnv("production", "minify", minifyOptions)
    configBuilder.pluginForEnv("production", "module:faster.js")
    configBuilder.pluginForEnv("production", "tailcall-optimization")
  } else {
    debug("Skipping minification")
  }

  if (hasContent(alias)) {
    configBuilder.plugin("module-resolver", {
      alias,
      cwd: configBuilder.cwd,
    })
  }

  configBuilder.plugin("pkg", {
    cwd: configBuilder.cwd,
  })

  const presetEnvOptions = {
    loose: options.loose,
    ...options.envOptions,
  }

  if (options.esm) {
    presetEnvOptions.modules = false
  }

  configBuilder.preset("@babel/preset-env", presetEnvOptions)

  debug("Final config: %j", configBuilder.config)

  if (options.outputConfig || process.env.outputBabelPresetJaid === "1") {
    const outputFile = path.join(configBuilder.cwd, "dist", "babel-preset-jaid", "config.json")
    fsExtra.outputJsonSync(outputFile, configBuilder.config, {spaces: 2})
  }

  return configBuilder.config
}