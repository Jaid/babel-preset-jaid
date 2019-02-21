import {dependencies as baseDependencies, configure as baseConfigure} from "../babel-preset-jaid"

export const description = "My personal Babel preset for JavaScript project that use React."

export const dependencies = [
  ...baseDependencies,
  "react",
]

export const configure = env => {
  const config = baseConfigure(env)
  config.plugins.unshift("react-require")
  if (env === "production") {
    config.presets.push("@babel/preset-react")
    config.plugins.push("transform-react-class-to-function")
    config.plugins.push("transform-react-remove-prop-types")
    config.plugins.push("@babel/plugin-transform-react-inline-elements")
  } else {
    config.presets.push([
      "@babel/preset-react",
      {development: true},
    ])
  }
  const moduleResolverPluginIndex = config.plugins.findIndex(plugin => Array.isArray(plugin) && plugin[0] === "module-resolver")
  config.plugins[moduleResolverPluginIndex][1].alias.components = "./src/components"
  return config
}