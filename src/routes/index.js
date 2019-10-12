import wellcome from './wellcome';
import users from './users';
import sessions from './sessions';

const controllers = [wellcome, users, sessions];

export default router => controllers.forEach(ctrl => ctrl(router));
