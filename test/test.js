import path from "path"

import {transformFileSync} from "@babel/core"
import fss from "@absolunet/fss"

const indexModule = process.env.MAIN ? path.resolve(__dirname, "..", process.env.MAIN) : path.join(__dirname, "..", "src")
const {default: babelPresetJaid} = require(indexModule)

const run = fixture => {
  for (const env of ["test", "development", "production"]) {
    it(env, () => {
      const inDir = path.join(__dirname, "fixtures", fixture)
      const presetJaidOptionsFile = path.join(inDir, "presetJaidOptions.yml")
      const presetJaidOptions = fss.pathExists(presetJaidOptionsFile) ? fss.readYaml(presetJaidOptionsFile) : {}
      const inFile = path.join(inDir, presetJaidOptions.typescript ? "in.ts" : "in.js")
      const outputDir = path.resolve(__dirname, "..", "dist", "test", fixture, env)
      const stats = transformFileSync(inFile, {
        envName: env,
        cwd: inDir,
        caller: {
          name: "babel-preset-jaid:test",
        },
        babelrc: false,
        presets: [
          api => {
            const config = babelPresetJaid(api, presetJaidOptions)
            fss.outputJson5(path.join(outputDir, "config.json5"), config, {space: 2})
            return config
          },
        ],
      })
      fss.outputJson5(path.join(outputDir, "stats.json5"), stats, {space: 2})
      fss.outputFile(path.join(outputDir, "out.js"), stats.code, "utf8")
    })
  }
}

describe("should run basic project", () => run("basic"))

describe("should run TypeScript project", () => run("typescript"))