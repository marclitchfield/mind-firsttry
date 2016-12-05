var path = require("path");

module.exports = [{
  context: path.join(__dirname, "app"),
  entry: "browser",
  output: {
    path: path.join(__dirname, "public", "scripts"),
    filename: "bundle.js"
  },
  devtool: "eval-source-map",
  module: {
    loaders: [
      { 
        test: /\.jsx?$/, 
        exclude: /node_modules/,
        loader: "babel-loader", 
        query: {
          plugins: ['transform-decorators-legacy']
        }
      }
    ]
  },
  resolve: {
    // you can now require('file') instead of require('file.coffee')
    extensions: ["", ".js", ".jsx"],
    root: [path.join(__dirname, "app")],
    modulesDirectories: ["node_modules"]
  }
}];
