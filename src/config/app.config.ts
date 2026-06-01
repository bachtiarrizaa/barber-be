export const appConfig = {
  port: process.env.PORT || 3000,
  host: process.env.APP_HOST || 'localhost',
  debug: process.env.APP_DEBUG === 'true',
};
