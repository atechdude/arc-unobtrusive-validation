const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
    entry: "./src/unobtrusviveValidation.ts",
    devtool: "source-map",
    mode: "production",
    node: {
        __dirname: false // It prevents Webpack from overriding the __dirname global
    },
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
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "@classes": path.resolve(__dirname, "src/classes/"),
            "@factory": path.resolve(__dirname, "src/factory/"),
            "@interfaces": path.resolve(__dirname, "src/interfaces/"),
            "@logging": path.resolve(__dirname, "src/logging/"),
            "@managers": path.resolve(__dirname, "src/managers/"),
            "@services": path.resolve(__dirname, "src/services/"),
            "@types": path.resolve(__dirname, "src/types/"),
            "@utils": path.resolve(__dirname, "src/utils/")
            // ... other aliases
        }
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
