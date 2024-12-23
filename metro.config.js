const { getDefaultConfig } = require("@expo/metro-config");

module.exports = (() => {
const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;

// SVG transformer configuration
config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
};

// Merge existing resolver config with node polyfills
config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
    extraNodeModules: {
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('react-native-crypto'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser'),
    util: require.resolve('util/'),
    vm: require.resolve('vm-browserify'),
    console: require.resolve('console-browserify'),
    }
};

return config;
})();
