import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';
import Dotenv from "dotenv-webpack";

export default {
    mode: 'production',
    entry: {
        content: './src/content/index.js',
        background: './src/background/index.js',
        react: './src/react/index.jsx',
    },
    output: {
        path: path.resolve('dist'),
        filename: '[name].js',
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['react'],
        }),
        new CopyPlugin({
            patterns: [{
                from: path.resolve('manifest.json'),
                to: path.resolve('dist'),
            }]
        }),
        new Dotenv()
    ],
    module: {
        rules: [
            {
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env', 
                            ['@babel/preset-react', {'runtime': 'automatic'}]
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    }
}