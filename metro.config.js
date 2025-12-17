// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  // You can add or override metro configuration options here if needed
};

// First merge with default config, then wrap with reanimated config
// module.exports = wrapWithReanimatedMetroConfig(mergeConfig(defaultConfig, config));
module.exports = mergeConfig(defaultConfig, config);
