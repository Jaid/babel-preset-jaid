const isDevelopment = process.env.NODE_ENV !== "production"

const presets = []
const plugins = []

const addPlugin = (plugin, options) => {
  if (options) {
    plugins.push([plugin, options])
  } else {
    plugins.push(plugin)
  }
}

const addDevPlugin = (plugin, options) => isDevelopment && addPlugin(plugin, options)
const addProdPlugin = (plugin, options) => !isDevelopment && addPlugin(plugin, options)

const addPreset = (preset, options) => {
  if (options) {
    presets.push([preset, options])
  } else {
    presets.push(preset)
  }
}

const addDevPreset = (preset, options) => isDevelopment && addPreset(preset, options)
const addProdPreset = (preset, options) => !isDevelopment && addPreset(preset, options)

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

const config = {
  plugins,
  presets
}

if (isDevelopment) {
  config.sourceMaps = "inline"
} else {
  config.comments = false
}

module.exports = () => config