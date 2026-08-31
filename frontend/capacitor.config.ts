import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ru.svodka.reports',
  appName: 'Сводка',
  webDir: 'dist',
  android: {
    backgroundColor: '#f3f6f9',
    allowMixedContent: false,
  },
}

export default config
