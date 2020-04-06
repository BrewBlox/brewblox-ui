import axios, { AxiosTransformer } from 'axios';
import isArray from 'lodash/isArray';

import { HOST } from '@/helpers/const';
import { deserialize, serialize } from '@/helpers/units/parseObject';

const { transformRequest, transformResponse } = axios.defaults;

function joined(defaults: typeof transformRequest, custom: AxiosTransformer[]): AxiosTransformer[] {
  if (defaults === undefined) {
    return custom;
  }
  else if (isArray(defaults)) {
    return [...defaults, ...custom];
  }
  else {
    return [defaults, ...custom];
  }
}

const instance = axios.create({
  baseURL: HOST,
  transformRequest: joined(transformRequest, [
    data => serialize(data),
  ]),
  transformResponse: joined(transformResponse, [
    data => deserialize(data),
  ]),
});

export default instance;
