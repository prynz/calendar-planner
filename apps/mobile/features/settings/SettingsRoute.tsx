import Constants from 'expo-constants';
import { useMemo } from 'react';

import { loadClientConfig } from '@/config/client-config';

import { SettingsScreen } from './SettingsScreen';

/** Wires runtime config (env, app version) into the presentational settings screen. */
export function SettingsRoute() {
  const clientConfig = useMemo(() => loadClientConfig(), []);
  return <SettingsScreen clientConfig={clientConfig} appVersion={Constants.expoConfig?.version ?? '0.0.0'} />;
}
