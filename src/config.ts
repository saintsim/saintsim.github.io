interface AppConfig {
    blockMorningHours: number[];
//    debugMode: boolean;
//    maxRetries: number;
//    environment: 'development' | 'production' | 'staging';
  }

export const weatherConfig: AppConfig = {
    blockMorningHours: [8, 9, 10, 11, 12]
//    apiUrl: 'https://api.example.com',
//    debugMode: process.env.NODE_ENV === 'development',
//    maxRetries: 3,
//    environment: process.env.NODE_ENV as 'development' | 'production' | 'staging'
};