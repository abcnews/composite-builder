module.exports = {
  type: 'basic',
  build: {
    to: 'docs',
    useCSSModules: false
  },
  clean: 'docs',
  devServer: {
    hot: false
  },
  webpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.output.publicPath = 'https://abcnews.github.io/composite-builder/';
    }

    return config;
  }
};
