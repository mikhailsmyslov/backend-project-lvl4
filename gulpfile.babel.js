import gulp from 'gulp';
import repl from 'repl';
import getServer from './src/server';
import { User } from './db/models';

gulp.task('console', () => {
  const replServer = repl.start({
    prompt: 'Application console > ',
  });
  replServer.context.User = User;
});

gulp.task('server', (cb) => {
  getServer().listen(process.env.PORT || 5000, cb);
});
