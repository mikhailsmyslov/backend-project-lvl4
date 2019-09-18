export default (router) => {
  router.get('root', '/', (ctx) => {
    ctx.body = 'Wellcome to the task manager!';
  });
};
