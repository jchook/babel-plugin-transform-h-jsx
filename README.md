## NOTE: This is a fork of `jchook/babel-plugin-transform-h-jsx`

This version of the babel plugin allows `data-` attributes as well.

# JSX to Virtual Hyperscript Babel Plugin

Turns [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) into
[virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript)
via [Babel](https://github.com/babel/babel).

This repo is essentially `transform-react-jsx` except it passes children as an
array instead of as additional arguments. You can
[read](https://github.com/henrikjoreteg/babel-plugin-h-children-fix)
[more](https://phabricator.babeljs.io/T2034)
[about](https://github.com/substack/babel-plugin-jsx-factory) this problem if
you like.

## Installation

  npm install --save-dev babel-plugin-transform-h-jsx

## Usage

You can run `babel` via command line:

    babel --preset transform-h-jsx your-file.jsx

Or add `transform-h-jsx` as a plugin in your babel config:

    {
      "plugins": ["transform-h-jsx"]
    }

## Options

* `pragma` (default: `'h'`)

## Webpack example

In your `webpack.config.js` file:

    module.exports = {
      output: {
        path: __dirname + "/dist/js",
        filename: "browser.js"
      },
      context: __dirname + "/src",
      entry: "./browser",
      module: {
        loaders: [
          {
            test: /\.jsx?$/,
            include: __dirname + '/src',
            loader: "babel-loader",
            query: {
              plugins: [
                ["transform-h-jsx"],
                ["syntax-jsx"]
              ]
            }
          }
        ]
      },
      resolve: {
        extensions: ['', '.js', '.jsx', '.json']
      }
    };
