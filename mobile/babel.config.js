module.exports = function (api) {
    api.cache(true);
    const plugins = [
        [
            'module-resolver',
            {
                root: ['./'],
                alias: {
                    '@': './',
                    '@shared': '../shared'
                }
            }
        ]
    ];

    // Reanimated plugin temporarily disabled due to worklets dependency issue
    // Will be re-enabled once react-native-worklets is properly configured
    // if (process.env.EXPO_PLATFORM !== 'web') {
    //     plugins.push('react-native-reanimated/plugin');
    // }

    return {
        presets: [
            [
                'babel-preset-expo',
                {
                    // Disable reanimated plugin in preset
                    reanimated: false
                }
            ]
        ],
        plugins
    };
};
