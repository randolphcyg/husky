import { request } from 'umi';

/**
 * @summary 更新项
 * @description 更新item项，如果找不到相应id的项则返回错误
 * @param {*} item 参数 {id,title,status}
 */
export async function updateItem(item) {
  const options = {
    method: 'PUT',
  };
  const url = '/api/item';
  options.data = item;
  return request(url, options);
}
/**
 * @summary 添加新项
 * @description 添加新的项目到todo列表中
 * @param {*} item 参数 {id,title,status}
 */
export async function addItem(item) {
  const options = {
    method: 'POST',
  };
  const url = '/api/item';
  options.data = item;
  return request(url, options);
}
/**
 * @summary 获取所有todo项
 * @description 获取所有todo项
 */
export async function getAll() {
    console.log('触发service getAll')
  const options = {
    method: 'GET',
  };
  const url = '/api/items';
  return request(url, options);
}
