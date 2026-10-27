import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.recruiterindustrial.app',
  appName: 'Recruiter Industrial',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    ...(process.env.CAPACITOR_SERVER_URL ? { url: process.env.CAPACITOR_SERVER_URL } : {})
  }
};

export default config;
