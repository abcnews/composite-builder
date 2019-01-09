module.exports = {
  type: 'react',
  build: {
    to: 'docs',
    useCSSModules: true
  },
  clean: 'docs',
  devServer: {
    hot: false,
    https: false
  },
  webpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.output.publicPath = 'https://abcnews.github.io/composite-builder/';
    } else if (process.env.NODE_ENV === 'surge') {
      config.output.publicPath = '/';
    }

    return Object.assign(config, {
      performance: {
        hints: false
      }
    });
  },
  babel: {
    // plugins: ['@babel/plugin-proposal-class-properties']
  }
};
