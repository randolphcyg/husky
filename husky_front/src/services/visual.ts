import { request } from 'umi';

export async function query() {
  return request<API.CurrentUser[]>('/api/visual');
}

