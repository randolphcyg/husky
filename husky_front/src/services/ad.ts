import { request } from 'umi';

export interface AdAccountParamsType {
  eip: string;
  name: string;
  department: string;
  title: string;
  email: string;
  tel: string;
}

/**
 * @summary 获取AD域账户列表
 * @description 获取列表
 */
export async function fetchAdAccountList() {
  console.log('触发service fetchAdAccountList');
  return request('/api/fetchAdAccountList', {
    method: 'GET',
  });
}
// service 创建AD域账户接口
export async function addAdAccount(params: AdAccountParamsType) {
  return request('/api/addAdAccount', {
    method: 'POST',
    data: params,
  });
}
