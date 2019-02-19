import {dependencies as baseDependencies, configure as baseConfigure} from "../babel-preset-jaid"

export const description = "My personal Babel preset for Node modules that use React."

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
  return config
}