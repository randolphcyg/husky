import { request } from 'umi';

// 邮件服务器表单数据项接口
export interface MailServerFormItemProps {
  mailServerSmtpServer: string;
  mailServerAdmin: string;
  mailServerAdminPwd: string;
  mailServerSender: string;
  adAccountHelpFile: string;
  testMailReceiver: string;
}

// 邮件服务器表单接口
export interface MailServerFormProps {
  onCheckMailServerConfigConnect: (values: MailServerFormItemProps) => void;
  onSaveMailServerConfig: (values: MailServerFormItemProps) => void;
}

// service 创建AD域账户接口
export async function saveMailServerConfig(params: MailServerFormItemProps) {
  return request('/api/saveMailServerConfig', {
    method: 'POST',
    data: params,
  });
}

// service 从redis加载邮件域服务器配置方法
export async function loadFormData() {
  return request('/api/loadMailServerConfigFormData', {
    method: 'GET',
  });
}

// service 测试发送邮件
export async function testSendMail(params: MailServerFormItemProps) {
  return request('/api/testSendMail', {
    method: 'POST',
    data: params,
  });
}
