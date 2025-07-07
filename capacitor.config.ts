import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.chronozen.app',
  appName: 'ChronoZen',
  webDir: 'out',
  server: {
    // For live-reload development, change the url to your computer's IP address.
    // url: 'http://192.168.1.100:9002', 
    // cleartext: true,
  }
};

export default config;
