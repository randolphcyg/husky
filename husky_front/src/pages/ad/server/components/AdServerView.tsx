import React, { Component } from 'react';
import { Button, Divider, Modal, message, Card } from 'antd';
import { connect } from 'umi';
import ProCard from '@ant-design/pro-card';
import ProTable from '@ant-design/pro-table';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProForm, { ProFormText } from '@ant-design/pro-form';

class AdServerView extends Component {
  // 在这定义一些表单需要的变量
  render() {
    return (
      <Card>
        <ProForm
          layout={'horizontal'}   // 垂直布局
          hideRequiredMark={true} // 隐藏必选标记
          scrollToFirstError={true}
        >
          <ProForm.Group title="连接配置">
            <ProFormText width="s" name="adServerIp" label="服务器IP" placeholder="192.168.255.233"
              rules={[
                // 这里需要正则格式化判断
                {
                  required: true,
                  message: '请正确填写服务器IP!'
                },
                {
                  pattern: /^[^\s]*$/,
                  message: '禁止输入空格!'
                }]} />
            <ProFormText width="l" name="baseDn" label="BASE_DN" placeholder="DC=GOING-LINK,DC=com"
              rules={[
                {
                  required: true,
                  message: '请填写AD服务器的distinguishName!'
                },
                {
                  pattern: /^[^\s]*$/,
                  message: '禁止输入空格!'
                }]} />
            <ProFormText width="l" name="adminAccount" label="管理员账户" initialValue="CN=Administrator,CN=Users,DC=XXX,DC=com"
              rules={[{
                required: true,
                message: '请填写AD服务器管理员账户!'
              }]} />
            <ProFormText width="s" name="adminPwd" label="管理员密码" placeholder=""
              rules={[
                {
                  required: true,
                  message: 'AD服务器管理员密码不可为空!'
                },
                {
                  pattern: /^[^\s]*$/,
                  message: '禁止输入空格!'
                }]} />
            {/* // 需要加测试通过按钮 */}
          </ProForm.Group>
          <ProForm.Group title="AD服务器个性化配置">
            <ProFormText width="s" name="zyPrefix" label="SAM账号前缀-子公司" placeholder="Z" />
            <ProFormText width="s" name="handPrefix" label="SAM账号前缀-母公司" placeholder="HAND" />
          </ProForm.Group>
        </ProForm>
      </Card>
    );
  }
}

export default AdServerView;