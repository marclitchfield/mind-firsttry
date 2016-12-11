var path = require("path");

module.exports = [{
  context: path.join(__dirname, "app"),
  entry: "browser",
  output: {
    path: path.join(__dirname, "public", "scripts"),
    filename: "bundle.js",
    sourceMapFilename: "[file].map"
  },
  devtool: "source-map",
  module: {
    loaders: [
      { 
        test: /\.jsx?$/, 
        loader: "babel"
      }
    ]
  },
  resolve: {
    extensions: ["", ".js", ".jsx"],
    root: [path.join(__dirname, "app")],
    modulesDirectories: ["node_modules"]
  }
}];
