import path from "path"
import fs from "fs"

import {isEmpty} from "lodash"
import preventStart from "prevent-start"
import loadJestConfig from "load-jest-config"

import BabelConfigBuilder from "./BabelConfigBuilder"

const debug = require("debug")("babel-preset-jaid")

export default (api, type) => {
  api.assertVersion("^7.2")

  const configBuilder = new BabelConfigBuilder(api)

  const cacheFactors = [api.version, api.env(), type || 0]

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

  const {jestConfig} = loadJestConfig({cwd: configBuilder.cwd})
  if (jestConfig?.moduleNameMapper) {
    debug("Found %s#jest.moduleNameMapper", configBuilder.pkgPath)
    for (const [from, to] of Object.entries(configBuilder.pkg.jest.moduleNameMapper)) {
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

  configBuilder.plugin("@babel/plugin-proposal-class-properties")
  configBuilder.plugin("@babel/plugin-proposal-do-expressions")
  configBuilder.plugin("@babel/plugin-proposal-pipeline-operator", {
    proposal: "smart",
  })
  configBuilder.plugin("@babel/plugin-proposal-optional-chaining")

  configBuilder.pluginForEnvsBut("production", "captains-log")

  configBuilder.presetForEnv("production", "minify", {
    removeConsole: true,
    removeDebugger: true,
  })

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

  configBuilder.preset("@babel/preset-env")

  debug("Final config: %j", configBuilder.config)

  return configBuilder.config
}