import { request } from 'umi';

// bug表格数据项接口
export interface BugInfoItemProps {
  num: string;
  title: string;
  level: string;
  status: string;
  manager: string;
  managers: string;
  managers_delay: string;
  
}

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