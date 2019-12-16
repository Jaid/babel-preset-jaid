# babel-preset-jaid


These are my personal Babel presets. They aim for minimizing boilerplate for projects that need Babel.

## Installation
<a href='https://npmjs.com/package/babel-preset-jaid'><img alt='npm logo' src='https://github.com/Jaid/action-readme/raw/master/images/base-assets/npm.png'/></a>
```bash
npm install --save-dev babel-preset-jaid@^7.1.0
```
<a href='https://yarnpkg.com/package/babel-preset-jaid'><img alt='Yarn logo' src='https://github.com/Jaid/action-readme/raw/master/images/base-assets/yarn.png'/></a>
```bash
yarn add --dev babel-preset-jaid@^7.1.0
```



## Documentation

* [babel-preset-jaid](#module_babel-preset-jaid)
    * [~default(api, options)](#module_babel-preset-jaid..default)
    * [~options](#module_babel-preset-jaid..options) : <code>Object</code>

**Kind**: inner method of [<code>babel-preset-jaid</code>](#module_babel-preset-jaid)  

| Param | Type | Description |
| --- | --- | --- |
| api | <code>object</code> | Babel api instance |
| options | <code>options</code> |  |

**Kind**: inner typedef of [<code>babel-preset-jaid</code>](#module_babel-preset-jaid)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [react] | <code>boolean</code> | <code>false</code> | If `true` or typeof `string`, `react`-related plugins and presets are included. If `react-, `react-dom`-related plugins and presets are also included. |
| [runtime] | <code>boolean</code> | <code>true</code> | If `true`, `@babel/plugin-transform-runtime` will be applied. |
| [minify] | <code>boolean</code> \| <code>Object</code> | <code>true</code> | If `false`, `babel-minify` won't be applied to production builds. If `true`, `babel-fy` will be applied with `{removeConsole: false, removeDebugger: true}` as configuration. If typeof `object`, this will bed as `babel-minify` config. |
| [envOptions] | <code>Object</code> | <code></code> | If typeof `object`, this will be used as options for `@babel/preset-env`. |
| [flow] | <code>boolean</code> | <code>false</code> | If `true`, support Facebook Flow. |
| [typescript] | <code>boolean</code> | <code>false</code> | If `true`, support Microsoft TypeScript. |
| [aotLoader] | <code>boolean</code> | <code>true</code> | If `true`, `aot-loader/babel` will be applied |
| [legacyDecorators] | <code>boolean</code> | <code>true</code> | If `true`, `plugin-proposal-decorators` will have `lecacy: true` and `plugin-proposal-class-properties` will have `loose: true` |
| [outputConfig] | <code>boolean</code> | <code>false</code> | If `true`, the generated Babel config will be written to `./dist/babel-preset-jaid/config.yml` (can be also activated with environment variable outputBabelPresetJaid=1) |



## License
```text
MIT License

Copyright © 2019, Jaid <jaid.jsx@gmail.com> (github.com/jaid)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
