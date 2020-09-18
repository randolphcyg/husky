import { request } from 'umi';

// export interface Item {
//   id: number;
//   title: string;
//   status: number;
// }

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

/**
 * @summary 更新项
 * @description 更新item项，如果找不到相应id的项则返回错误
 * @param {*} Item 参数 {id,title,status}
 */
export async function updateItem(params: Item) {
  return request('/api/item', {
    method: 'PUT',
    data: params,
  });
}
/**
 * @summary 添加新项
 * @description 添加新的项目到todo列表中
 * @param {*} Item 参数 {id,title,status}
 */
export async function addItem(params: Item) {
  return request('/api/item', {
    method: 'POST',
    data: params,
  });
}
