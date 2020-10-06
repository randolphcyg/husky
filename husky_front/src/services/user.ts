import { request } from 'umi';


export async function query() {
  return request<API.CurrentUser[]>('/api/users');
}

export async function queryCurrent(params: string) {
  console.log('services')
  console.log(params)
  return request<API.CurrentUser>('/api/currentUser', {
    method: 'POST',
    data: params,
  });
}

export async function queryNotices(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/notices');
}