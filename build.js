import path from "path"
import fs, {write} from "fs"
import jsYaml from "js-yaml"
import extractModulesFromBabelConfig from "./extractModulesFromBabelConfig"
import rootPkg from "./package.json"
import {empSync} from "emp"
import filterObj from "filter-obj"
import {pick} from "lodash"
import chalk from "chalk"
import prettyBytes from "pretty-bytes"
import writeJsonFile from "write-json-file"

const presets = fs.readdirSync(path.join(__dirname, "packages"))

for (const name of presets) {

  console.log(`- ${chalk.green(name)}`)

  const presetPath = path.resolve(__dirname, "packages", name)
  const buildPath = path.resolve(__dirname, "build", name)
  const configBuildPath = path.join(buildPath, "babel.json")

  const copyFile = file => fs.copyFileSync(file, path.join(buildPath, file))

  empSync(buildPath)
  const pkg = jsYaml.safeLoad(fs.readFileSync(path.join(presetPath, "package.yml"), "utf-8"))
  const config = jsYaml.safeLoad(fs.readFileSync(path.join(presetPath, "babel.yml"), "utf-8"))
  const referencedModules = extractModulesFromBabelConfig(config)
  const generatedPkg = {
    name,
    dependencies: filterObj(rootPkg.devDependencies, key => referencedModules.includes(key)),
    ...pick(rootPkg, "version", "author", "license", "repository"),
    ...pkg,
    peerDependencies: {
      lodash: rootPkg.devDependencies.lodash,
      ...pkg.peerDependencies && filterObj(rootPkg.devDependencies, key => pkg.peerDependencies.includes(key))
    },
  }

  writeJsonFile.sync(configBuildPath, config)
  writeJsonFile.sync(path.join(buildPath, "package.json"), generatedPkg)
  copyFile("license.txt")
  copyFile("readme.md")
  fs.writeFileSync(path.join(buildPath, "index.js"), "module.exports=()=>require(\"./babel.json\")")

  console.log(`  index.json: ${prettyBytes(fs.statSync(configBuildPath).size)}`)

}