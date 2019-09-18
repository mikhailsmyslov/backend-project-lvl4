import wellcome from './wellcome';

const controllers = [
  wellcome,
];

export default (router) => controllers.forEach((ctrl) => ctrl(router));
