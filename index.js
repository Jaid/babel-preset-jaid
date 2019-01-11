const isDevelopment = process.env.NODE_ENV !== "production"

const presets = []
const plugins = []

const addPlugin = (plugin, config) => {
  if (config) {
    plugins.push([plugin, config])
  } else {
    plugins.push(plugin)
  }
}

const addDevPlugin = (plugin, config) => isDevelopment && addPlugin(plugin, config)
const addProdPlugin = (plugin, config) => !isDevelopment && addPlugin(plugin, config)

const addPreset = (preset, config) => {
  if (config) {
    presets.push([preset, config])
  } else {
    presets.push(preset)
  }
}

const addDevPreset = (preset, config) => isDevelopment && addPreset(preset, config)
const addProdPreset = (preset, config) => !isDevelopment && addPreset(preset, config)

addPlugin("root-import")
addPlugin("version")
addPlugin("@babel/proposal-optional-chaining")
addPlugin("@babel/proposal-pipeline-operator", {proposal: "minimal"}) // I want to have the smart proposal in the future: https://github.com/babel/babel/pull/9179
addDevPlugin("console-source")
addProdPlugin("lodash")
addProdPlugin("optimize-starts-with")
addProdPlugin("tailcall-optimization")
addProdPlugin("module:faster.js")
addProdPlugin("transform-imports")
addProdPreset("minify", {
  "removeConsole": true,
  "removeDebugger": true
})
addPreset("@babel/env", {
  targets: {
    node: "10"
  }
})

config = {
  plugins,
  presets
}

if (isDevelopment) {
  config.sourceMaps = "inline"
} else {
  config.comments = false
}

module.exports = () => config