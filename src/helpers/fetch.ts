import axios from 'axios';

import { HOST } from '@/helpers/const';
import { deserialize, serialize } from '@/helpers/units/parseObject';

const instance = axios.create({
  baseURL: HOST,
  transformRequest: [data => serialize(data)],
  transformResponse: [data => deserialize(data)],
});

export default instance;
