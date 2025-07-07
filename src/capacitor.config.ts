import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.chronozen.app',
  appName: 'ChronoZen',
  webDir: 'out',
  server: {
    // For live-reload development with a cloud IDE,
    // replace this with the public URL for port 9002.
    url: 'http://YOUR_PUBLIC_IP_OR_URL:9002', 
    cleartext: true,
  }
};

export default config;
