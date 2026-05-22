const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { execSync } = require('child_process');

module.exports = {
  packagerConfig: {
    asar: true,
    osxSign: {},
    osxNotarize: undefined,
    entitlements: './entitlements.mac.plist',
    entitlementsInherit: './entitlements.mac.plist',
    extendInfo: './extend.plist',
    ignore: [
      /^\/src/,
      /(.eslintrc.json)|(.gitignore)|(electron.vite.config.ts)|(forge.config.js)|(tsconfig.*)/,
      /^\/out/,
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    postPackage: async (forgeConfig, options) => {
      if (options.platform === 'darwin') {
        const appPath = `${options.outputPaths[0]}/${forgeConfig.packagerConfig.name || 'Hinario IASD 4MacOS'}.app`;
        console.log(`\n\nSigning application at: ${appPath}`);
        try {
          execSync(`codesign --force --deep --sign - --entitlements ./entitlements.mac.plist "${appPath}"`);
          console.log('Ad-hoc signing complete.');
        } catch (error) {
          console.error('Failed to sign the app:', error);
        }
      }
    }
  }
};
