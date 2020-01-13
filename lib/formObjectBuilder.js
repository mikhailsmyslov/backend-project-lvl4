import _ from 'lodash';

export default (data, err = { errors: [] }) => ({
  data,
  errors: _.groupBy(err.errors, 'path'),
});
