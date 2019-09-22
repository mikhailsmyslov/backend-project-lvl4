import buildServer from '../server';

buildServer().listen(process.env.PORT || 5000);
