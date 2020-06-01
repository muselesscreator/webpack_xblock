import axios from 'axios';
import { counter as uris } from 'variables/uris';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN';

export const updateCount = (mkUrl) => axios.post(
  mkUrl(uris.increment),
  JSON.stringify({ hello: 'world' }),
);
