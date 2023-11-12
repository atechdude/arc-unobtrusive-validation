
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    mode: "production",

    entry: {
        "arc-unobtrusive-validation": "./src/arc-validation.ts",
        "arc-unobtrusive-validation-auto": "./src/arc-validation-auto.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        library: {
            name: "arcvalidation",
            type: "umd",
            export: "default"
        },
        globalObject: "this"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
        //new BundleAnalyzerPlugin({
        //    // You can set `analyzerMode` to `server`, `static`, or `disabled`.
        //    // In `server` mode a server is started, `static` generates a .html file,
        //    // and `disabled` doesn't generate any output but you can still use it as a module in your code.
        //    analyzerMode: "static",

        //    // Path to generated report file, relative to the output directory
        //    reportFilename: "report.html",

        //    // Automatically open the report in the browser
        //    openAnalyzer: true
        //})
    ]
};
