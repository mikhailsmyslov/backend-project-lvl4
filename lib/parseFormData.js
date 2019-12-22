export default (form = {}) =>
  Object.entries(form).reduce(
    (acc, [key, value]) => (!value ? { ...acc, [key]: null } : { ...acc, [key]: value }),
    {}
  );
