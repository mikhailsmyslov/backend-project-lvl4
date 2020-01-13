import wellcome from './wellcome';
import users from './users';
import sessions from './sessions';
import tasks from './tasks';
import statuses from './statuses';

const controllers = [wellcome, users, sessions, tasks, statuses];

export default (router) => controllers.forEach((ctrl) => ctrl(router));
