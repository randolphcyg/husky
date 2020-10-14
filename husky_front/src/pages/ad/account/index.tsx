import { AdAccountInfoItemProps, AdAccountParamsType, AdAccountPwdParamsType, addAdAccount, ModalFormProps, resetAdAccountPwd } from "@/services/ad";
import { ClockCircleOutlined, DownOutlined, ExclamationCircleOutlined, FormOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ProColumnType } from '@ant-design/pro-table/es/Table';
import { Select, Button, DatePicker, Divider, Dropdown, Form, Input, Menu, message, Modal, Popconfirm, Table, Tag, Transfer } from 'antd';
import difference from 'lodash/difference';
import moment from "moment";
import React, { useState } from 'react';
import { request } from 'umi';

const { RangePicker } = DatePicker;

const AdAccountPage: React.FC<ModalFormProps> = () => {
  const [proForm] = ProForm.useForm();
  const [resetPwdProForm] = ProForm.useForm();
  const [visible, setVisible] = useState(false);    // 创建账户模态框状态
  const [loading, setLoading] = useState(true);    // 表格加载
  const [btnCreateLoading, setBtnCreateLoading] = useState(false);    // 创建按钮异步任务
  const [btnUpdateLoading, setBtnUpdateLoading] = useState(false);    // 更新按钮异步任务
  const [hrVisible, setHrVisible] = useState(false);  // hr系统同步用户模态框状态
  const [visibleResetPwdModal, setVisibleResetPwdModal] = useState(false);    // 修改密码模态框状态
  const [inputResetPwdVisible, setInputResetPwdVisible] = useState(false);    // 修改密码模态框表单 修改类型输入框状态
  const [btnResetPwdLoading, setBtnResetPwdLoading] = useState(false);    // 修改密码 按钮状态
  // 重设密码模态框表单信息
  const resetPwdmodalProps = {
    resetPwdSam: '',
    resetPwdDisplayName: '',
    resetPwdMail: '',
    newManualPwd: '',    // 新密码
  }

  const columns: Array<ProColumnType<AdAccountInfoItemProps>> = [
    {
      title: '姓名',
      dataIndex: 'displayName',
      fixed: 'left',
      width: 100,
      copyable: true,
    },
    {
      title: '账号',
      dataIndex: 'sAMAccountName',
      hideInForm: true,
      // fixed: 'left',      // 固定左侧
      width: 130,
    },
    // {
    //   title: 'objectGUID',
    //   dataIndex: 'objectGUID',
    //   hideInForm: true,
    //   width: 300,
    // },
    {
      title: '邮箱',
      dataIndex: 'mail',
      copyable: true,
      hideInForm: true,
      hideInSearch: true,
      width: 260,
    },
    // 等待LDAP数据全量更新，mobile字段替代telephoneNumber字段更准确些，注意其他平台同步修改
    {
      title: '移动电话',
      dataIndex: 'mobile',
      copyable: true,
      hideInForm: true,
      hideInSearch: true,
      width: 120,
    },
    {
      title: '手机号',
      dataIndex: 'telephoneNumber',
      copyable: true,
      hideInForm: true,
      hideInSearch: true,
      width: 120,
    },
    {
      title: '职位',
      dataIndex: 'title',
      hideInForm: true,
      hideInSearch: true,
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'department',
      // ellipsis: true,           // 省略过长文本
      hideInForm: true,
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'whenCreated',
      hideInForm: true,
      width: 200,
      valueType: 'dateTime',
      renderFormItem: () => {
        // 重写时间框选替代时间搜索
        return <RangePicker
          ranges={{
            '最近三月': [moment().subtract(3, 'months'), moment()],
            '最近三周': [moment().subtract(3, 'weeks'), moment()],
            '最近三天': [moment().subtract(3, 'days'), moment()],
            '今天': [moment().startOf('day'), moment()],
            '最近一小时': [moment().subtract(1, 'hours'), moment()],
          }}
          showTime
          format="YYYY/MM/DD HH:mm:ss"
        />;
      }
    },
    {
      title: '修改时间',
      dataIndex: 'whenChanged',
      hideInForm: true,
      width: 200,
      valueType: 'dateTime',
      renderFormItem: () => {
        // 重写时间框选替代时间搜索
        return <RangePicker
          ranges={{
            '最近三月': [moment().subtract(3, 'months'), moment()],
            '最近三周': [moment().subtract(3, 'weeks'), moment()],
            '最近三天': [moment().subtract(3, 'days'), moment()],
            '今天': [moment().startOf('day'), moment()],
            '最近一小时': [moment().subtract(1, 'hours'), moment()],
          }}
          showTime
          format="YYYY/MM/DD HH:mm:ss"
        />;
      }
    },
    {
      title: '操作',
      dataIndex: 'options',
      hideInForm: true,
      hideInSearch: true,
      fixed: 'right',
      width: 150,
      render: (text, record) =>
        <Popconfirm title="确定重设该用户密码？" okText="确定" cancelText="点错了"
          icon={<ExclamationCircleOutlined />}
          onConfirm={() => resetLdapAccountPwd(record)}>
          <Button danger
            loading={btnResetPwdLoading}
          >重设密码</Button>
        </Popconfirm>,
    },
  ]

  async function handleSubmit(values: AdAccountParamsType) {
    try {
      // 提交创建申请 到service方法
      const msg = await addAdAccount({ ...values });
      if (msg.code === 0) {
        message.success(msg.message);
      } else {
        message.error(msg.message);
      }
      setBtnCreateLoading(false);    // 按钮加载结束
      return;
    }
    // 如果提交失败
    catch (error) {
      message.error('创建失败，请重试!');
    }
  };

  // 创建账号
  const onCreate = (values: AdAccountParamsType) => {
    setBtnCreateLoading(true);    // 按钮加载状态
    handleSubmit(values);
    setVisible(false);
  };
  // 从母公司的HR系统创建账号
  function batchAddHandAdAccount() {
    setHrVisible(true);
    console.log('穿梭框左表可搜索HAND hr系统用户表，将选中用户向右侧发送，即可生成ldap账号')
  }

  // 重设密码触发方法
  function resetLdapAccountPwd(record) {
    resetPwdmodalProps.resetPwdSam = record['sAMAccountName'];
    resetPwdmodalProps.resetPwdDisplayName = record['displayName'];
    resetPwdmodalProps.resetPwdMail = record['mail'];
    resetPwdProForm.setFieldsValue(resetPwdmodalProps);    // 模态框表单塞值
    setBtnResetPwdLoading(true);    // 修改密码按钮加载状态
    setVisibleResetPwdModal(true);    // 模态框加载状态
  }

  // 重设密码模态框下拉框
  function onSelectResetPwdTypechange(value: string) {
    if (value === 'auto') {
      resetPwdProForm.setFieldsValue({'newManualPwd': ''})    // 前端不给定新的密码
      console.log(resetPwdProForm.getFieldValue('newManualPwd'))
      setInputResetPwdVisible(false);   // 自动重设密码输入框隐藏
    } else if (value === 'manual') {
      setInputResetPwdVisible(true);    // 手动重设密码输入框出现
    }
  }

  // 异步处理提交重设密码
  async function handleResetPwdSubmit(values: AdAccountPwdParamsType) {
    try {
      // 提交重设密码申请 到service方法
      const msg = await resetAdAccountPwd({ ...values });
      if (msg.code === 0) {
        message.success(msg.message);
      } else {
        message.error(msg.message);
      }
      setBtnResetPwdLoading(false);    // 修改密码按钮加载结束
      return;
    }
    // 如果提交失败
    catch (error) {
      message.error('提交重设密码申请失败，请重试!');
    }
  };

  /**
 *  删除节点
 * @param selectedRows
 */
  const handleRemove = async (selectedRows: AdAccountInfoItemProps[]) => {
    console.log(selectedRows)
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
      // await removeRule({
      //   key: selectedRows.map((row) => row.key),
      // });
      console.log('调用service 方法执行批量操作!')
      hide();
      message.success('删除成功，即将刷新');
      return true;
    } catch (error) {
      hide();
      message.error('删除失败，请重试');
      return false;
    }
  };

  function updateLdapUsers() {
    setBtnUpdateLoading(true);
    console.log('手动更新LDAP服务器用户');
  }

  // 自定义穿梭框中表格
  const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
    <Transfer {...restProps} showSelectAll={false}
      // 穿梭框样式
      listStyle={{
        width: 250,
        height: 450,
      }}
    >
      {({
        direction,
        filteredItems,
        onItemSelectAll,
        onItemSelect,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const modelTransterTableColumns = direction === 'left' ? leftColumns : rightColumns;

        const rowSelection = {
          getCheckboxProps: (item: { disabled: any; }) => ({ disabled: listDisabled || item.disabled }),
          onSelectAll(selected: boolean, selectedRows: any[]) {
            const treeSelectedKeys = selectedRows
              .filter((item: { disabled: any; }) => !item.disabled)
              .map(({ key }) => key);
            const diffKeys = selected
              ? difference(treeSelectedKeys, listSelectedKeys)
              : difference(listSelectedKeys, treeSelectedKeys);
            onItemSelectAll(diffKeys, selected);
          },
          onSelect({ key }: any, selected: boolean) {
            onItemSelect(key, selected);
          },
          selectedRowKeys: listSelectedKeys,
        };

        return (
          <Table
            rowSelection={rowSelection}
            columns={modelTransterTableColumns}
            dataSource={filteredItems}
            pagination={{                 // 分页
              showQuickJumper: true,
              pageSize: 6   // 每页6条数据
            }}
            size="small"
            style={{ pointerEvents: listDisabled ? 'none' : null }}
            onRow={({ key, disabled: itemDisabled }) => ({
              onClick: () => {
                if (itemDisabled || listDisabled) return;
                onItemSelect(key, !listSelectedKeys.includes(key));
              },
            })}
          />
        );
      }}
    </Transfer>
  );

  const mockTags = ['admin', 'zy', 'hand'];

  const mockData = [];
  for (let i = 0; i < 20; i++) {
    mockData.push({
      key: i.toString(),
      title: `佩奇${i + 1}`,
      description: `佩奇打野${i + 1}`,
      // disabled: i % 4 === 0,
      tag: mockTags[i % 3],
    });
  }

  const originTargetKeys = mockData.filter(item => +item.key % 3 > 1).map(item => item.key);

  // 穿梭框
  const [targetKeys, setTargetKeys] = useState(originTargetKeys);
  const leftTableColumns = [
    {
      dataIndex: 'title',
      title: '姓名',
    },
    {
      dataIndex: 'tag',
      title: '标签',
      render: (tag: React.ReactNode) => <Tag>{tag}</Tag>,
    },
    {
      dataIndex: 'description',
      title: '描述',
    },
  ];
  const rightTableColumns = [
    {
      dataIndex: 'title',
      title: '姓名',
    },
  ];
  // 穿梭框数据修改方法
  const onTransferChange = (nextTargetKeys: React.SetStateAction<string[]>) => {
    console.log('onTransferChange 触发');
    console.log(nextTargetKeys);
    setTargetKeys(nextTargetKeys);
  }

  return (
    <PageHeaderWrapper>
      <ProTable
        headerTitle="AD域用户列表"
        rowKey="sAMAccountName"
        columns={columns}             // 列名
        loading={loading}             // 加载中
        onLoad={() => setLoading(false)}  // 数据加载完操作
        scroll={{ x: 1300 }}          // 滑动轴
        pagination={{                 // 分页
          showQuickJumper: true,
          pageSize: 10   // 每页10条数据
        }}
        // 表格请求数据
        request={async (params = {}) =>
          request<{
            data: AdAccountInfoItemProps[];
          }>('/api/fetchAdAccountList', {
            params,
          })
        }
        // 表格搜索
        search={{
          defaultCollapsed: false,
          defaultColsNumber: 1,
          split: true,
          span: 8,
          collapsed: false,   // 不收起查询
          collapseRender: () => { return <></>; },  // 收起按钮渲染为空(去掉收起按钮)
          optionRender: ({ searchText, resetText }, { form }) => {
            return [
              <Button key="searchText" type="primary"
                onClick={() => { form?.submit(); }} >{searchText}</Button>,
              <Button key="resetText" type="default"
                onClick={() => { form?.resetFields(); }} >{resetText}</Button>,
            ];
          },
          searchText: '查询'
        }}
        toolBarRender={(action, { selectedRows }) => [
          // 多选情况下出现的按钮
          selectedRows && selectedRows.length > 0 && (
            <Dropdown
              overlay={
                <Menu
                  onClick={async (e) => {
                    if (e.key === 'remove') {
                      await handleRemove(selectedRows);
                      action.reload();
                    }
                  }}
                  selectedKeys={[]}
                >
                  <Menu.Item key="btnBatchRemove">批量删除</Menu.Item>
                  <Menu.Item key="btnBatchApproval">批量审批</Menu.Item>
                </Menu>
              }
            >
              <Button>
                批量操作 <DownOutlined />
              </Button>
            </Dropdown>
          ),
          // 按钮
          <Divider key='divider-batchOption' type="vertical" />,
          <Button type="primary" key='btn-addAdAccount'
            loading={btnCreateLoading} onClick={() => setVisible(true)} icon={<FormOutlined />}>创建账号</Button>,
          <Divider key='divider-addAdAccount' type="vertical" />,
          <Button type="default" key='btn-batchAddHandAdAccount' onClick={() => batchAddHandAdAccount()}>HR系统创建账号</Button>,
          <Divider key='divider-updateLDAP' type="vertical" />,
          <Popconfirm title="确定更新LDAP服务器用户？" okText="确定" cancelText="点错了"
            icon={<ExclamationCircleOutlined />} onConfirm={updateLdapUsers}>
            <Button type="default" key='btn-updateLDAP' icon={<ClockCircleOutlined />}
              loading={btnUpdateLoading}>手动更新LDAP用户</Button>
          </Popconfirm>
        ]
        }
        rowSelection={{}}   // 多选
      />

      <Modal
        destroyOnClose
        visible={hrVisible}
        title="Hand系统创建账号"
        okText="保存"
        cancelText="取消"
        onCancel={() => { setHrVisible(false); }}
        onOk={() => { setHrVisible(false) }}
        width={1000}
        style={{ top: 20 }}
      >
        {/* 模态框中的穿梭框 */}
        <TableTransfer
          dataSource={mockData}
          targetKeys={targetKeys}
          disabled={false}    // 无数据部分灰色
          showSearch={true}    // 搜索框
          onChange={onTransferChange}    // 每次变化时触发方法
          filterOption={(inputValue: any, item: { title: string | any[]; tag: string | any[]; }) =>
            item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
          }
          leftColumns={leftTableColumns}
          rightColumns={rightTableColumns}
        />
      </Modal>

      <Modal
        destroyOnClose
        visible={visible}
        title="创建账户"
        okText="提交创建"
        cancelText="取消操作"
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          proForm
            .validateFields()
            .then(values => {
              proForm.resetFields();
              onCreate(values);
            })
            .catch(info => {
              console.log('验证模态框表单失败:', info);
            });
        }}
      >
        <ProCard>
          <ProForm
            form={proForm}          // 表单数据
            layout={'horizontal'}   // 垂直布局
            hideRequiredMark={true} // 隐藏必选标记
            scrollToFirstError={true}
            submitter={false}   // 去除表单自带提交按钮
          >
            <ProForm.Group title="基础信息">
              <ProFormText width="xs" name="eid" label="工号" placeholder="25578"
                rules={[
                  {
                    required: true,
                    message: '请填写工号!'
                  },
                  {
                    pattern: /^[^\s]*$/,
                    message: '禁止输入空格!'
                  }]} />
              <ProFormText width="xs" name="displayName" label="姓名" placeholder="甄小明"
                rules={[
                  {
                    required: true,
                    message: '请填写姓名!'
                  },
                  {
                    pattern: /^[^\s]*$/,
                    message: '禁止输入空格!'
                  }]} />
              <ProFormText width="xs" name="title" label="岗位" initialValue="技术顾问" rules={[{ required: true, message: '请填写岗位!' }]} />
              <ProFormText width="s" name="department" label="部门" placeholder="甄云科技.产品研发中心.产品技术中心.供应商和协议部"
                rules={[
                  {
                    required: true,
                    message: '请填写部门!'
                  },
                  {
                    pattern: /^[^\s]*$/,
                    message: '禁止输入空格!'
                  }]} />
            </ProForm.Group>
            <ProForm.Group title="联系信息">
              <ProFormText width="s" name="mail" label="邮箱" placeholder="XXX@XXX-china.com"
                rules={[
                  {
                    required: true,
                    message: '请填写邮箱!'
                  },
                  {
                    pattern: /^[^\s]*$/,
                    message: '禁止输入空格!'
                  }]} />
              <ProFormText width="s" name="telephoneNumber" label="手机" placeholder="手机号"
                rules={[
                  {
                    required: true,
                    message: '请填写手机号!'
                  },
                  {
                    pattern: /^1[3456789]\d{9}$/,
                    message: '手机格式错误!',
                  }]}
                getValueFromEvent={(e) => {
                  return e.target.value.replace(/[^0-9]/ig, "");
                }} />
            </ProForm.Group>
          </ProForm>
        </ProCard>
      </Modal>

      <Modal
        title="修改用户密码"
        visible={visibleResetPwdModal}
        onCancel={() => setVisibleResetPwdModal(false)}
        okText="确认"
        cancelText="取消"
        onOk={() => {
          resetPwdProForm
            .validateFields()
            .then(values => {
              handleResetPwdSubmit(values);
              setVisibleResetPwdModal(false);
            })
            .catch(info => {
              console.log('验证模态框表单失败:', info);
            });
        }}
      >
        <ProForm
          submitter={false}           // 去除表单自带提交按钮
          form={resetPwdProForm}      // 表单数据
        >
          <Form.Item label="账号" name="resetPwdSam" style={{ 'color': 'red' }}>
            <span className="ant-form-text" style={{ 'backgroundColor': 'yellow' }}>{resetPwdProForm.getFieldValue('resetPwdSam')}</span>
          </Form.Item>
          <Form.Item label="姓名" name="resetPwdDisplayName" style={{ 'color': 'red', }}>
            <span className="ant-form-text" style={{ 'backgroundColor': 'yellow' }}>{resetPwdProForm.getFieldValue('resetPwdDisplayName')}</span>
          </Form.Item>
          <Form.Item label="邮箱" name="resetPwdMail" style={{ 'color': 'red', }}>
            <span className="ant-form-text" style={{ 'backgroundColor': 'yellow' }}>{resetPwdProForm.getFieldValue('resetPwdMail')}</span>
          </Form.Item>
          {/* 管理员选择随机密码或手动设置一个符合复杂度条件的密码(前后端进行复杂度判断) */}
          <Form.Item label="密码修改方式">
            <Select
              key="resetPwdType"
              defaultValue="auto"
              options={[
                { value: 'auto', label: '自动修改[系统自动生成8位复杂密码并发送至用户邮箱]', },
                { value: 'manual', label: '手动修改', }
              ]}
              onChange={onSelectResetPwdTypechange}
            />
          </Form.Item>
          {inputResetPwdVisible && (
            <div>
              <Form.Item name="newManualPwd" label="密码"
                rules={[
                  {
                    required: true,
                    message: '请输入八位以上复杂密码!'
                  },
                  {
                    pattern: /^[^\s]*$/,
                    message: '禁止输入空格!'
                  }]} ><Input.Password />
              </Form.Item>
            </div>
          )}
        </ProForm>
      </Modal>
    </PageHeaderWrapper>
  );
};

export default AdAccountPage;