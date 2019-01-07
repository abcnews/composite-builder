module.exports = {
  type: 'react',
  build: {
    to: 'docs',
    useCSSModules: true
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
  },
  babel: {
    plugins: ['@babel/plugin-proposal-class-properties']
  }
};
