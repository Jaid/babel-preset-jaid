export const description = "My personal Babel preset for modern JavaScript."

export const dependencies = [
  "@babel/core",
  "@babel/cli",
  "@babel/node",
  "@babel/register",
]

export const configure = env => {
  const presets = ["@babel/preset-env"]
  const plugins = [
    [
      "module-resolver",
      {
        cwd: "packagejson",
        alias: {
          root: ".",
          lib: "src/lib",
        },
      },
    ],
    "@babel/transform-runtime",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-do-expressions",
    "@babel/plugin-proposal-optional-chaining",
    [
      "@babel/plugin-proposal-pipeline-operator",
      {
        proposal: "smart",
      },
    ],
  ]
  const config = {
    presets,
    plugins,
  }
  if (env === "development") {
    plugins.push("console-source")
  }
  if (env === "test") {
    presets.push("@ava/babel-preset-transform-test-files")
  }
  if (env === "production") {
    config.comments = false
    presets.push([
      "minify",
      {
        removeConsole: true,
        removeDebugger: true,
      },
    ])
    plugins.push("lodash")
    plugins.push("tailcall-optimization")
    plugins.push("module:faster.js")
    plugins.push("transform-imports")
  } else {
    config.sourceMaps = "inline"
  }
  return config
}