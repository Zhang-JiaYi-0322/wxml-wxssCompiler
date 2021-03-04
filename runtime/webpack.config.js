const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = () => {
    context = __dirname;
    const config = {
        devtool: false,
        mode: "development",
        output: {
            path: path.resolve(context, 'dist'),
            filename: '[name].js',
            libraryTarget: "commonjs"
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: require.resolve('ts-loader'), options: {
                        transpileOnly: true,
                        compilerOptions: {
                            sourceMap: true
                        }
                    }
                },
                {
                    test: /\.css?$/,
                    // loader: require.resolve('style-loader') + "!" + require.resolve('css-loader')
                    use: [require.resolve('style-loader'), require.resolve('css-loader')]
                },
                // {
                //     test: /\.(eot|woff|ttf|png|gif|svg|otf|exe)([\?]?.*)$/,
                //     use: [
                //         {
                //             loader: require.resolve('url-loader'),
                //             options: {
                //                 limit: 10240
                //             }
                //         }


                //     ]
                // }
            ]
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
        },
        externals: {
        },
        entry: { 'bundle': './src/main' },
        target: 'web',
        plugins: [
            new ForkTsCheckerWebpackPlugin()
        ]

    }
    return config;
}