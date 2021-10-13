import { AdServerFormItemProps, AdServerFormProps, loadAdServerConfigFormData, saveAdServerConfig, testAdServerConfigIsConnect } from "@/services/ad";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Button, Divider, Form, Input, message, Popconfirm } from 'antd';
import React, { useEffect, useState } from 'react';

const AdServerView: React.FC<AdServerFormProps> = (props) => {
  const [proForm] = ProForm.useForm();
  const [initialFormValues, setValues] = useState({});    // 表单数据初始化
  const [loading, setLoading] = useState(false);    // 表单loading

  useEffect(() => {
    initForm();
  }, []);

  // 初始化表单数据
  async function initForm() {
    setLoading(true);
    try {
      const msg = await loadAdServerConfigFormData();
      if (msg.code === 0) {
        setValues(msg.body);
      } else {
        message.error(msg.message);
      }
    }
    // 如果操作失败
    catch (error) {
      message.error('获取AD配置失败，请重试!');
    }
    setLoading(false);
  }

  // 测试AD服务器配置是否连通
  const onCheckAdServerConfigConnect = (values: AdServerFormItemProps) => {
    handleSubmitTest(values);   // 调用提交测试
  };

  // 测试AD服务器
  async function handleSubmitTest(values: AdServerFormItemProps) {
    try {
      // 提交测试申请 到service方法
      const msg = await testAdServerConfigIsConnect({ ...values });
      if (msg.code === 0) {
        message.success(msg.message);
      } else {
        message.error(msg.message);
      }
      return;
    }
    // 如果提交失败
    catch (error) {
      message.error('创建失败，请重试!');
    }
  };

  // 保存AD服务器配置信息
  const onSaveAdServerConfig = (values: AdServerFormItemProps) => {
    handleSubmit(values);   // 调用保存判断
  };

  async function handleSubmit(values: AdServerFormItemProps) {
    try {
      // 提交创建申请 到service方法
      const msg = await saveAdServerConfig({ ...values });
      if (msg.code === 0) {
        message.success(msg.message);
      } else {
        message.error(msg.message);
      }
      return;
    }
    // 如果提交失败
    catch (error) {
      message.error('创建失败，请重试!');
    }
  };

  return (
    <ProCard bordered={true} loading={loading}>
      <ProForm
        form={proForm}          // 表单数据
        hideRequiredMark={true} // 隐藏必选标记
        scrollToFirstError={true}
        submitter={false}   // 去除表单自带提交按钮
        // 表单初始值从redis读取
        initialValues={initialFormValues}
      >
        <ProForm.Group title="1.连接配置">
          <ProFormText name="adServerIp" label="服务器IP" placeholder="192.168.xxx.xxx"
            rules={[
              {
                required: true,
                message: '请填写服务器IP!'
              },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/,
                message: 'IP格式错误!'
              }]} />
          <ProFormText name="baseDn" label="BASE_DN" placeholder="DC=xxx,DC=com"
            rules={[
              {
                required: true,
                message: '请填写AD服务器的distinguishName!'
              },
              {
                pattern: /^[^\s]*$/,
                message: '禁止输入空格!'
              }]} />
          <ProFormText name="adminAccount" label="管理员账户" placeholder="CN=Administrator,CN=Users,DC=XXX,DC=com"
            rules={[{
              required: true,
              message: '请填写AD服务器管理员账户!'
            }]} />
          <Form.Item name="adminPwd" label="管理员密码"
            rules={[
              {
                required: true,
                message: 'AD服务器管理员密码不可为空!'
              },
              {
                pattern: /^[^\s]*$/,
                message: '禁止输入空格!'
              }]} ><Input.Password />
          </Form.Item>
        </ProForm.Group>
        <ProForm.Group title="2.AD服务器个性化配置">
          {/* 需要改成下拉搜索框组件，存储 XX公司: XX公司账号前缀 常量键值对 */}
          <ProFormText name="zyPrefix" label="SAM账号前缀-子公司" placeholder="Z" />
          <ProFormText name="handPrefix" label="SAM账号前缀-母公司" placeholder="HAND" />
          <ProFormText name="searchFilterUser" label="用户对象过滤条件" placeholder="(objectclass=user)" />
          <ProFormText name="searchFilterOu" label="OU对象过滤条件" placeholder="(objectclass=organizationalUnit)" />
          <ProFormText name="baseDnDisabled" label="离职账户OU" placeholder="OU=disabled,DC=GOING-LINK,DC=com" />
          <ProFormText name="baseDnEnabled" label="在职账户OU" placeholder="OU=XX公司,DC=GOING-LINK,DC=com" />
          <ProFormText name="baseDnHand" label="HAND账户OU" placeholder="OU=汉得信息,OU=上海总部,OU=XX公司" />
        </ProForm.Group>
        <Button type="default" onClick={() => {
          proForm.validateFields()
            .then(values => {
              onCheckAdServerConfigConnect(values);
            })
            .catch(info => {
              console.log('验证模态框表单失败:', info);
            });
        }}>测试连接</Button>
        <Divider key='divider-onCheckAdServerConfigConnect' dashed={true} type="vertical" />
        <Popconfirm title="确定修改？" okText="是" cancelText="否" icon={<ExclamationCircleOutlined />}
          onConfirm={() => {
            proForm.validateFields()
              .then(values => {
                onSaveAdServerConfig(values);
              })
              .catch(info => {
                console.log('验证模态框表单失败:', info);
              });
          }}
        >
          <Button type='primary'>保存配置</Button>
        </Popconfirm>
      </ProForm>
    </ProCard>
  );
}

export default AdServerView;
