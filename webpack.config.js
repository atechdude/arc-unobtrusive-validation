const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
    entry: "./src/unobtrusviveValidation.ts",
    devtool: "source-map",
    mode:"development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        filename: "arc-unobtrusive-validation.js",
        library: {
            name: "arcvalidation",
            type: "umd",
            export:"default"
        },
        globalObject: "this",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};
