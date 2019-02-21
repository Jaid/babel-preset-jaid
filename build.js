import path from "path"

import {empSync} from "emp"
import filterObj from "filter-obj"
import {pick} from "lodash"
import chalk from "chalk"
import prettyBytes from "pretty-bytes"
import fss from "@absolunet/fss"

import rootPkg from "./package.json"
import extractModulesFromBabelConfig from "./extractModulesFromBabelConfig"

const presets = fss.readdir(path.join(__dirname, "packages"))

for (const name of presets) {
  console.log(`- ${chalk.green(name)}`)

  const presetPath = path.resolve(__dirname, "packages", name)
  const buildPath = path.resolve(__dirname, "dist", name)
  const packageBuildPath = path.join(buildPath, "package.json")

  const copyFile = file => fss.copyFile(file, path.join(buildPath, file))

  empSync(buildPath)

  let referencedModules = []
  const {configure, description, dependencies} = require(presetPath)
  for (const env of ["test", "development", "production"]) {
    const envConfig = configure(env)
    fss.outputJson(path.join(buildPath, `${env}.json`), envConfig)
    referencedModules = [...referencedModules, ...extractModulesFromBabelConfig(envConfig)]
  }

  const generatedPkg = {
    name,
    description,
    ...pick(rootPkg, "version", "author", "license", "repository"),
    dependencies: filterObj(rootPkg.devDependencies, key => referencedModules.includes(key) || dependencies.includes(key)),
    peerDependencies: {...pick(rootPkg.devDependencies, "@babel/runtime")},
  }

  fss.outputJson(packageBuildPath, generatedPkg)
  copyFile("license.txt")
  copyFile("readme.md")
  copyFile("index.js")

  console.log(`  index.js: ${prettyBytes(fss.stat(path.join(buildPath, "index.js")).size)}`)
  console.log(`  package.json: ${prettyBytes(fss.stat(packageBuildPath).size)}`)
}