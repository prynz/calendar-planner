import type { ConfigContext, ExpoConfig } from 'expo/config';

import { brand, identifiers } from '@nowish/brand';
import { palette } from '@nowish/ui/tokens';

/**
 * Build variants (EAS profile / CI env `APP_VARIANT`):
 *  - development: dev client (Metro), separate id
 *  - preview:     prototype test builds (Android APK, iOS simulator) – never published (ADR 0008)
 *  - production:  reserved for Phase 10
 * Identifiers stay neutral until trademark clearance (ADR 0007).
 */
type Variant = 'development' | 'preview' | 'production';

const variant: Variant =
  process.env.APP_VARIANT === 'development' || process.env.APP_VARIANT === 'preview'
    ? process.env.APP_VARIANT
    : 'production';

const suffix = variant === 'production' ? '' : `.${variant === 'development' ? 'dev' : 'preview'}`;
const nameSuffix = variant === 'production' ? '' : variant === 'development' ? ' (Dev)' : ' (Preview)';
const bundleId = `${identifiers.bundleIdBase}${suffix}`;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `${brand.name}${nameSuffix}`,
  slug: identifiers.expoSlug,
  scheme: identifiers.urlScheme,
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/brand/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: palette.ink900,
  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: false,
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: bundleId,
    adaptiveIcon: {
      backgroundColor: palette.ink900,
      foregroundImage: './assets/brand/android-icon-foreground.png',
      monochromeImage: './assets/brand/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Privacy by default: nothing in Phase 1 needs these. Location/contacts/camera are added
    // deliberately in the phase that needs them (docs/security/privacy.md).
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA',
      'android.permission.READ_CONTACTS',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
    ],
  },
  plugins: [
    'expo-router',
    'expo-status-bar',
    'expo-sqlite',
    'expo-localization',
    'expo-font',
    ['expo-notifications', { color: palette.lime400 }],
    [
      'expo-splash-screen',
      {
        image: './assets/brand/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: palette.ink900,
      },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: { variant },
});
