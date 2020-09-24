import { request } from 'umi';

export interface ADUserParamsType {
  eip: string;
  name: string;
  department: string;
  title: string;
  email: string;
  tel: string;
}

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
// service 新增AD域用户接口
export async function addADUser(params: ADUserParamsType) {
  console.log('触发service addADUser');
  return request('/api/addADUser', {
    method: 'POST',
    data: params,
  });
}
