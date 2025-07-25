// babel.config.js - Babel configuration for Jest testing

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
    }],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
}; 