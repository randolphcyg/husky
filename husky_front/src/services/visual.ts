import { request } from 'umi';

export interface SearchParamsType {
  type: string;
}


export async function query(params: SearchParamsType) {
  return request<API.CurrentUser[]>('/api/visual', {
    method: 'POST',
    data: params,
  });
  
}


