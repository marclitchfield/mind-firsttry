var path = require("path");

module.exports = [{
  context: path.join(__dirname, "public", "scripts"),
  entry: "app",
  output: {
    path: path.join(__dirname, "public", "scripts"),
    filename: "bundle.js"
  },
  devtool: "eval-source-map",
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: "babel-loader"}
    ]
  },
  resolve: {
    // you can now require('file') instead of require('file.coffee')
    extensions: ["", ".js", ".jsx"],
    root: [path.join(__dirname, "public", "scripts")],
    modulesDirectories: ["node_modules"]
  }
}];
