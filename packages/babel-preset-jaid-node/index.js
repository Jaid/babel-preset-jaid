import {dependencies as baseDependencies, configure as baseConfigure} from "../babel-preset-jaid"

export const description = "My personal Babel preset for Node modules."

export const dependencies = baseDependencies

export const configure = env => {
  const config = baseConfigure(env)
  config.presets[0] = [
    "@babel/preset-env",
    {
      targets: {node: 10},
    },
  ]
  return config
}