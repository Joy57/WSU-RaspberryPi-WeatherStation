var path = require('path');
var webpack = require('webpack');
    
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'public/build'),
        filename: 'bundle.js',
        publicPath : '/public/'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react', 'stage-2'],
                    plugins: ['transform-class-properties']
                }
            },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.(png|jpg|gif)$/, use: [ 'file-loader' ] },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
            { test: /\.scss$/, loaders: ['style', 'css', 'sass'] }
        ]
    },
    stats: {
        colors: true
    },
    node: {
        fs: 'empty'
    },
    devtool: 'source-map'
};