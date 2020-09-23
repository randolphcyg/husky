import { request } from 'umi';

/**
 * @summary 获取AD域用户列表
 * @description 获取列表
 */
export async function fetchADUserList() {
  console.log('触发service fetchADUserList');
  return request('/api/fetchADUserList', {
    method: 'GET',
  });
}