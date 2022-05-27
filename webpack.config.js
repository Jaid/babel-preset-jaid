import configure from "webpack-config-jaid"

export default configure({
  documentation: true,
  extra: {
    experiments: {
      outputModule: false,
      topLevelAwait: false,
    },
    output: {
      module: false,
      library: {
        type: "umd2",
      },
    },
  },
})