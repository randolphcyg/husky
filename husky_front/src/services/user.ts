import { request } from 'umi';

// 用户账户表单接口
export interface AccountFormItemProps {
  ldap: string;
  name: string;
  email: string;
  tel: string;
  title: string;
}

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

// service 从redis加载用户配置方法
export async function loadAccountConfigFormData() {
  return request('/api/loadAccountConfigFormData', {
    method: 'GET',
  });
}
// service 保存用户信息方法
export async function saveAccountConfig(params: AccountFormItemProps) {
  // 暂时没有确定传值对象
  return request('/api/saveAccountConfig', {
    method: 'POST',
    data: params,
  });
}
