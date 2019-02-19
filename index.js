module.exports = api => {
  if (api.env("production")) {
    return require("./production.json")
  }
  if (api.env("test")) {
    return require("./test.json")
  }
  return require("./development.json")
}