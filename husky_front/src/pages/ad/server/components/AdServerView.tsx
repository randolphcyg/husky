import React from 'react';

import { connect } from 'umi';
import { Button, Divider } from 'antd';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormText } from '@ant-design/pro-form';

// AD服务器表单数据项接口
interface AdServerFormItemProps {
  adServerIp: string;
  baseDn: string;
  adminAccount: string;
  adminPwd: string;
  zyPrefix: string;
  handPrefix: string;
};

// AD服务器表单接口
interface AdServerFormProps {
  onCheckAdServerConfigConnect: (values: AdServerFormItemProps) => void;
  onSaveAdServerConfig: (values: AdServerFormItemProps) => void;
};

const AdServerView: React.FC<AdServerFormProps> = (props) => {
  const [proForm] = ProForm.useForm();
  // 测试AD服务器配置是否连通
  const onCheckAdServerConfigConnect = async () => {
    console.log('onCheckAdServerConfigConnect AD服务器连通性测试，一个系统允许配置一个AD域服务器');
    try {
      const values = await proForm.validateFields();
      console.log('成功:', values);
    } catch (errorInfo) {
      console.log('失败:', errorInfo);
    }
  };

  // 保存AD服务器配置信息
  const onSaveAdServerConfig = async () => {
    console.log('onSaveAdServerConfig 保存AD服务器配置');
    try {
      const values = await proForm.validateFields();
      console.log('成功:', values);
    } catch (errorInfo) {
      console.log('失败:', errorInfo);
    }
  };

  return (
    <ProCard bordered={true}>
      <ProForm
        form={proForm}          // 表单数据
        hideRequiredMark={true} // 隐藏必选标记
        scrollToFirstError={true}
        submitter={false}   // 去除表单自带提交按钮
      >
        <ProForm.Group title="1.连接配置">
          <ProFormText name="adServerIp" label="服务器IP" placeholder="192.168.255.233"
            rules={[
              {
                required: true,
                message: '请填写服务器IP!'
              },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/,
                message: 'IP格式错误!'
              }]} />
          <ProFormText name="baseDn" label="BASE_DN" placeholder="DC=GOING-LINK,DC=com"
            rules={[
              {
                required: true,
                message: '请填写AD服务器的distinguishName!'
              },
              {
                pattern: /^[^\s]*$/,
                message: '禁止输入空格!'
              }]} />
          <ProFormText name="adminAccount" label="管理员账户" initialValue="CN=Administrator,CN=Users,DC=XXX,DC=com"
            rules={[{
              required: true,
              message: '请填写AD服务器管理员账户!'
            }]} />
          <ProFormText name="adminPwd" label="管理员密码" placeholder=""
            rules={[
              {
                required: true,
                message: 'AD服务器管理员密码不可为空!'
              },
              {
                pattern: /^[^\s]*$/,
                message: '禁止输入空格!'
              }]} />
        </ProForm.Group>
        <ProForm.Group title="2.AD服务器个性化配置">
          {/* 需要改成下拉搜索框组件，存储 XX公司: XX公司账号前缀 常量键值对 */}
          <ProFormText name="zyPrefix" label="SAM账号前缀-子公司" placeholder="Z" />
          <ProFormText name="handPrefix" label="SAM账号前缀-母公司" placeholder="HAND" />
        </ProForm.Group>
        <Button type="default" onClick={onCheckAdServerConfigConnect}>测试连接</Button>
        <Divider key='divider-onCheckAdServerConfigConnect' dashed={true} type="vertical" />
        <Button type='primary' onClick={onSaveAdServerConfig}>保存配置</Button>
      </ProForm>
    </ProCard>
  );
}

// export default AdServerView;
export default connect(({ }) => ({}))(AdServerView);