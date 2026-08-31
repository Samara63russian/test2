import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ru.formasvodki.app',
  appName: 'Форма Сводки',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
