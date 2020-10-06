import { request } from 'umi';

export async function query() {
  return request<API.CurrentUser[]>('/api/users');
}

// 获取当前用户信息
export async function queryCurrent(params: string) {
  return request<API.CurrentUser>('/api/currentUser', {
    method: 'POST',
    data: params,
  });
}

export async function queryNotices(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/notices');
}
