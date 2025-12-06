const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.assetExts.push(
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'
);

// Add TypeScript support
config.resolver.sourceExts.push('ts', 'tsx');

module.exports = config;
