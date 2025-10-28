// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'], // Root directory for aliases
          alias: {
            '@': './src', // Match your tsconfig alias
          },
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      // Ensure 'react-native-reanimated/plugin' is last if you use it
      'react-native-reanimated/plugin',
      
    ],
  };
};