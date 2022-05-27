// import {expect, it} from "@jest/globals"

// import path from "node:path"
// import {fileURLToPath} from "node:url"

// import fss from "@absolunet/fss"
// import {transformFileSync} from "@babel/core"

// const dirName = path.dirname(fileURLToPath(import.meta.url))
// const indexPath = process.env.MAIN ? path.resolve(dirName, "..", process.env.MAIN) : path.join(dirName, "..", "src")

// /**
//  * @type { import("../src") }
//  */
// const {default: babelPresetJaid} = await import(indexPath)

// const run = fixture => {
//   for (const env of ["test", "development", "production"]) {
//     it(env, () => {
//       const inDir = path.join(dirName, "fixtures", fixture)
//       const presetJaidOptionsFile = path.join(inDir, "presetJaidOptions.yml")
//       const presetJaidOptions = fss.pathExists(presetJaidOptionsFile) ? fss.readYaml(presetJaidOptionsFile) : {}
//       const inFile = path.join(inDir, presetJaidOptions.typescript ? "in.ts" : "in.js")
//       const outputDir = path.resolve(dirName, "..", "dist", "test", fixture, env)
//       const stats = transformFileSync(inFile, {
//         envName: env,
//         cwd: inDir,
//         caller: {
//           name: "babel-preset-jaid:test",
//         },
//         babelrc: false,
//         presets: [
//           api => {
//             const config = babelPresetJaid(api, presetJaidOptions)
//             fss.outputJson5(path.join(outputDir, "config.json5"), config, {space: 2})
//             return config
//           },
//         ],
//       })
//       fss.outputJson5(path.join(outputDir, "stats.json5"), stats, {space: 2})
//       fss.outputFile(path.join(outputDir, "out.js"), stats.code, "utf8")
//     })
//   }
// }

// describe("should run basic project", () => run("basic"))

// describe("should run TypeScript project", () => run("typescript"))