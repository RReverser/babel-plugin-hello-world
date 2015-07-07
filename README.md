# babel-plugin-hello-world

Extended plugin sample for Babel.

## Installation

```sh
$ npm install babel-plugin-hello-world
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["hello-world"]
}
```

### Via CLI

```sh
$ babel --plugins hello-world script.js
```

### Via Node API

```javascript
require('babel').transform('code', {
  plugins: ['hello-world']
});
```
