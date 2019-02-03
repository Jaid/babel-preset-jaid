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
  const buildPath = path.resolve(__dirname, "dist", name)
  const configBuildPath = path.join(buildPath, "babel.json")
  const packageBuildPath = path.join(buildPath, "package.json")

  const copyFile = file => fs.copyFileSync(file, path.join(buildPath, file))

  empSync(buildPath)
  const pkg = jsYaml.safeLoad(fs.readFileSync(path.join(presetPath, "package.yml"), "utf-8"))
  const config = jsYaml.safeLoad(fs.readFileSync(path.join(presetPath, "babel.yml"), "utf-8"))
  const referencedModules = extractModulesFromBabelConfig(config)
  const generatedPkg = {
    name,
    ...pick(rootPkg, "version", "author", "license", "repository"),
    ...pick(pkg, "description"),
    dependencies: filterObj(rootPkg.devDependencies, key => referencedModules.includes(key) || pkg.dependencies?.includes(key)),
    peerDependencies: pkg.peerDependencies && filterObj(rootPkg.devDependencies, key => pkg.peerDependencies.includes(key))
  }

  fs.outputJsonSync(configBuildPath, config)
  fs.outputJsonSync(packageBuildPath, generatedPkg)
  copyFile("license.txt")
  copyFile("readme.md")
  copyFile("index.js")

  console.log(`  babel.json: ${prettyBytes(fs.statSync(configBuildPath).size)}`)
  console.log(`  package.json: ${prettyBytes(fs.statSync(packageBuildPath).size)}`)

}