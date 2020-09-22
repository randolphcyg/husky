import { request } from 'umi';

/**
 * @summary 获取列表
 * @description 获取列表
 */
export async function getAll() {
  console.log('触发service getAll');
  return request('/api/items', {
    method: 'GET',
  });
}