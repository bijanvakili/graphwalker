import * as webpack from "webpack";
import * as _ from "lodash";
import miniCssExtractPlugin from "mini-css-extract-plugin";
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
import path from "path";

const packagesJson = require("./package.json");
const vendorExclusions = [
  "bootstrap-css-only",
  "apollo-server-express",
  "body-parser",
  "express",
  "node-fetch",
];
const vendorPackageNames = _.chain(packagesJson.dependencies).keys().difference(vendorExclusions).value();

const isProduction = process.env.NODE_ENV === "production";
const defaultOptions: Partial<webpack.Configuration> = {
  devtool: isProduction ? "source-map" : "inline-source-map",
  performance: {
    hints: isProduction ? "warning" : false,
  },
  mode: isProduction ? "production" : "development",
};
if (isProduction) {
  defaultOptions.optimization = {
    minimizer: [new TerserJSPlugin({ sourceMap: true }), new OptimizeCSSAssetsPlugin({ sourceMap: true })],
  };
}

const outputDirectory = path.join(__dirname, "dist");
const metaArtifactsDirectory = path.join(outputDirectory, "meta");
const outputAssetsDirectory = path.join(outputDirectory, "assets");
const vendorLibrariesDirectory = path.join(__dirname, "node_modules");
const defaultOutputOptions = {
  filename: "bundle-[name].js",
  path: outputAssetsDirectory,
};
const defaultRules = [
  // stylesheets
  {
    test: /\.(css|less)$/i,
    use: [
      {
        loader: miniCssExtractPlugin.loader,
        options: {
          hmr: !isProduction,
        },
      },
      {
        loader: "css-loader",
        options: {
          sourceMap: true,
          importLoaders: 1,
        },
      },
      {
        loader: "less-loader",
        options: {
          sourceMap: true,
          strictMath: true,
        },
      },
    ],
  },
];
const defaultPlugins = [
  new miniCssExtractPlugin({
    filename: "bundle-[name].css",
    chunkFilename: isProduction ? "[id].[hash].css" : "[id].css",
  }),
];

const config = [
  // vendor bundle
  {
    ...defaultOptions,

    name: "vendor",

    entry: {
      vendor: vendorPackageNames,
    },
    output: {
      ...defaultOutputOptions,
      library: "vendor",
    },
    module: {
      rules: defaultRules,
    },
    plugins: [
      ...defaultPlugins,
      new webpack.DllPlugin({
        context: __dirname,
        name: "[name]",
        path: path.join(metaArtifactsDirectory, "[name]-manifest.json"),
      }),
    ],
  },
  // application bundle
  {
    ...defaultOptions,

    name: "app",

    entry: {
      index: "./src/client/index.html",
      app: "./src/client/index.tsx",
      boostrap: [path.resolve(vendorLibrariesDirectory, "bootstrap-css-only/css/bootstrap.css")],
    },
    resolve: {
      alias: {
        images: path.resolve(__dirname, "images"),
      },
      extensions: [".ts", ".tsx", ".js", ".css", ".less"],
    },

    plugins: [
      ...defaultPlugins,
      new webpack.DllReferencePlugin({
        context: __dirname,
        name: "vendor",
        manifest: path.join(metaArtifactsDirectory, "vendor-manifest.json"),
      }),
      new webpack.WatchIgnorePlugin([vendorLibrariesDirectory, outputDirectory]),
    ],

    output: defaultOutputOptions,

    module: {
      rules: [
        ...defaultRules,
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: "tsconfig.json",
              },
            },
          ],
        },
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
        },
        // All .svg files should be included separately without bundling
        {
          test: /\.svg$/,
          loader: "file-loader",
          options: {
            emitFile: true,
            outputPath: "images",
            name: "[name].[ext]",
          },
        },
        // All facivon.ico files should go into root folder
        {
          test: /favicon.ico$/,
          loader: "file-loader",
          options: {
            emitFile: true,
            name: "[name].[ext]",
          },
        },
        // index.html should be included without bundling
        {
          test: /index\.html$/,
          loader: "file-loader",
          options: {
            emitFile: true,
            name: "[name].[ext]",
          },
        },
      ],
    },
  },
];

export default config;
