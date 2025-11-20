import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trashee.app',
  appName: 'Trashee',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    Geolocation: {
      permissions: ['location']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF'
    }
  }
};

export default config;
