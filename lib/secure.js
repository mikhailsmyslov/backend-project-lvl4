import crypto from 'crypto';

export default (value) => crypto
  .createHmac('sha256', process.env.SECRET_HMAC_KEY)
  .update(value)
  .digest('hex');
