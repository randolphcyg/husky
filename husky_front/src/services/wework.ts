import { request } from 'umi';

// 企业微信通讯录管理测试
export async function weworkContact() {
  return request('/api/weworkContact', {
    method: 'GET',
  });
}
// 企业微信app测试
export async function weworkLdap() {
  return request('/api/weworkLdap', {
    method: 'GET',
  });
}

// 企业微信获取用户列表
export async function featchWeworkUserList() {
    return request('/api/featchWeworkUserList', {
      method: 'GET',
    });
  }
