import path from "path"
import fs from "fs-extra"
import jsYaml from "js-yaml"
import extractModulesFromBabelConfig from "./extractModulesFromBabelConfig"
import rootPkg from "./package.json"
import {empSync} from "emp"
import filterObj from "filter-obj"
import {pick} from "lodash"
import chalk from "chalk"
import prettyBytes from "pretty-bytes"

const presets = fs.readdirSync(path.join(__dirname, "packages"))

for (const name of presets) {

  console.log(`- ${chalk.green(name)}`)

  const presetPath = path.resolve(__dirname, "packages", name)
  const buildPath = path.resolve(__dirname, "build", name)
  const configBuildPath = path.join(buildPath, "index.json")

  empSync(buildPath)
  const pkg = jsYaml.safeLoad(fs.readFileSync(path.join(presetPath, "package.yml"), "utf-8"))
  const config = jsYaml.safeLoad(fs.readFileSync(path.join(presetPath, "babel.yml"), "utf-8"))
  const referencedModules = extractModulesFromBabelConfig(config)
  const generatedPkg = {
    name,
    main: "index.json",
    dependencies: filterObj(rootPkg.devDependencies, key => referencedModules.includes(key)),
    ...pick(rootPkg, "version", "author", "license", "repository"),
    ...pkg,
    peerDependencies: {
      lodash: rootPkg.devDependencies.lodash,
      ...pkg.peerDependencies && filterObj(rootPkg.devDependencies, key => pkg.peerDependencies.includes(key))
    },
  }

  fs.outputJsonSync(configBuildPath, config)
  fs.outputJsonSync(path.join(buildPath, "package.json"), generatedPkg)
  fs.copyFileSync("license.txt", path.join(buildPath, "license.txt"))
  fs.copyFileSync("readme.md", path.join(buildPath, "readme.md"))

  console.log(`  index.json: ${prettyBytes(fs.statSync(configBuildPath).size)}`)

}