import { request } from 'umi';

// AD账号数据项接口
export interface AdAccountParamsType {
  eip: string;
  name: string;
  department: string;
  title: string;
  email: string;
  tel: string;
}

// AD服务器表单数据项接口
export interface AdServerFormItemProps {
  adServerIp: string;
  baseDn: string;
  adminAccount: string;
  adminPwd: string;
  zyPrefix: string;
  handPrefix: string;
  searchFilterUser: string;
  searchFilterOu: string;
  baseDnDisabled: string;
  baseDnEnabled: string;
  baseDnHand: string;
}

// AD服务器表单接口
export interface AdServerFormProps {
  onCheckAdServerConfigConnect: (values: AdServerFormItemProps) => void;
  onSaveAdServerConfig: (values: AdServerFormItemProps) => void;
}

// AD域账户信息数据项接口
export interface AdAccountInfoItemProps {
  sam: string;
  name: string;
  department: string;
  email: number;
  telphone: string;
  title: string;
  options: any;
}

// 模态框表单数据项接口
export interface ModalFormItemProps {
  eid: string;
  name: string;
  department: string;
  email: string;
  tel: string;
}

// 模态框表单接口
export interface ModalFormProps {
  visible: boolean;
  onCreate: (values: ModalFormItemProps) => void;
  onCancel: () => void;
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

// service 测试AD域服务器配置连通方法
export async function testAdServerConfigIsConnect(params: AdServerFormItemProps) {
  return request('/api/testAdServerConfigIsConnect', {
    method: 'POST',
    data: params,
  });
}

// service 保存AD域服务器配置方法
export async function saveAdServerConfig(params: AdServerFormItemProps) {
  return request('/api/saveAdServerConfig', {
    method: 'POST',
    data: params,
  });
}

// service 从redis加载AD域服务器配置方法
export async function loadAdServerConfigFormData() {
  return request('/api/loadAdServerConfigFormData', {
    method: 'GET',
  });
}
