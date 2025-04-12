
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.payday.planner',
  appName: 'Payday Planner',
  webDir: 'dist',
  server: {
    url: "https://873baa5b-a820-4975-ae9a-f64372d84a75.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
