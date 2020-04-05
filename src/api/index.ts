import axios, { AxiosRequestConfig } from 'axios';

import { API_SERVER, ACCESS_TOKEN_HEADER, TOKEN } from 'src/config';
import { EncodeDTO, EncodeResultDTO } from 'src/models';

axios.interceptors.request.use((config) => {
  const newConfig = { ...config };
  newConfig.headers[ACCESS_TOKEN_HEADER] = TOKEN;
  return newConfig;
});

export async function listEncode(): Promise<EncodeDTO[]> {
  const config: AxiosRequestConfig = {
    url: `${API_SERVER}/encodes`,
    method: 'get',
  };

  return (await axios(config)).data.results;
}

export async function updateEncode(encodeId: number, args: Partial<EncodeDTO>): Promise<void> {
  const config: AxiosRequestConfig = {
    url: `${API_SERVER}/encodes/${encodeId}`,
    method: 'put',
    data: args,
  };

  await axios(config);
}

export async function updateEncodeBefore(encodeId: number, args: Omit<EncodeResultDTO, 'id' | 'date'>): Promise<void> {
  const config: AxiosRequestConfig = {
    url: `${API_SERVER}/encodes/${encodeId}/before`,
    method: 'post',
    data: args,
  };

  await axios(config);
}

export async function updateEncodeAfter(encodeId: number, args: Omit<EncodeResultDTO, 'id' | 'date'>): Promise<void> {
  const config: AxiosRequestConfig = {
    url: `${API_SERVER}/encodes/${encodeId}/after`,
    method: 'post',
    data: args,
  };

  await axios(config);
}
