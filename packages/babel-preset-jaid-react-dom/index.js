import {dependencies as baseDependencies, configure as baseConfigure} from "../babel-preset-jaid-react"

export const description = "My personal Babel preset for webapps that use React."

export const dependencies = [
  ...baseDependencies,
  "react-dom",
  "react-hot-loader",
]

export const configure = env => {
  const config = baseConfigure(env)
  if (env === "development") {
    config.plugins.push("react-hot-loader/babel")
  }
  config.presets[0] = "@babel/preset-env" // Removing the node target from preset-env
  return config
}