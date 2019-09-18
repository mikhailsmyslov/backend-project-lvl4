import buildServer from './app';

buildServer().listen(process.env.PORT || 5000);
