import { User } from '../db/models';
import encrypt from '../lib/secure';

const LocalStrategy = require('passport-local').Strategy;

export default (passport) => {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => User.findByPk(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null)));

  const options = {
    usernameField: 'email',
    passwordField: 'password',
  };

  passport.use(
    new LocalStrategy(options, (email, password, done) => User.findOne({ where: { email } })
      .then((user) => (user
        && encrypt(password) === user.passwordDigest
        ? done(null, user)
        : done(null, false)))
      .catch((err) => done(err))),
  );
};
