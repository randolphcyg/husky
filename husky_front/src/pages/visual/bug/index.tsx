import React, { Component } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Divider, Alert, Modal, message, Radio } from 'antd';
import { connect } from 'umi';
import { addItem, updateItem } from '@/services/visual';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';    // 柱状图
import 'echarts/lib/chart/line';    //折线图


var dataSet = [10, 15, 30, 20];

class VisualPage extends Component {
  state = {
    modalVisible: false,
  }

  componentDidMount() {
    this.loadData();
  }

  generateCharts = async (item) => {
    console.log(item)
    // 图表显示容器
    let el = document.getElementById("main");
    console.log(el)
    // 图表初始化
    let myChart = echarts.init(el);

    setInterval(() => {

      var dataSet1 = dataSet.map(function (ele) {
        return Math.random(20) * ele;
      })

      // 图表配置项
      let option = {
        title: {
          text: '柱状图',
          subtext: '销量统计'
        },
        xAxis: {
          data: ["河北", "河北", "山西", "广州"]
        },
        yAxis: {
          gridIndex: 0,
          min: 0,
          max: 30,
          interval: 5
        },
        series: [{
          name: '销量',
          type: 'bar',
          data: dataSet1
        }],
        legend: {
          show: true,
          data: [{
            name: '销量',
            icon: 'circle'
          }]
        }
      }

      // 进行图表配置
      myChart.setOption(option);

    }, 1000);
  }

  //获取列表
  loadData() {
    console.log('页面方法 loadData');
    //使用connect后，dispatch通过props传给了组件
    const { dispatch } = this.props;
    dispatch({ type: 'visual/fetchTodoList', payload: null });
    console.log('dispatch结束');
  }

  handleModalVisible(visible: boolean) {
    this.setState({ modalVisible: visible });
    this.generateCharts();  // TODO 生成echarts dom节点没生成，元素取不到
  }


  render() {
    const { visual } = this.props;
    const { todoList } = visual;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        hideInForm: true,
      },
      {
        title: '标题',
        dataIndex: 'title',
        rules: [
          {
            required: true,
            message: '待办事项标题不能为空',
          },
        ]
      },
      {
        title: '操作',
        hideInForm: true,
        render: (_, record) => {
          const operations = [];
          operations.push(<Button type='primary' key='btn-generate' onClick={() => this.handleModalVisible(true)} >可视化</Button>);
          operations.push(<Divider key='divider-generate' type="vertical" />);
          operations.push(<Button key='btn-second' onClick={() => this.generateCharts(record)}>次按钮</Button>);
          operations.push(<Divider key='divider-second' type="vertical" />);
          operations.push(<Button key='btn-dashed' type="dashed">虚拟按钮</Button>);
          return (
            <>
              {operations}
            </>
          )

        },
      },
    ]
    return (
      <PageHeaderWrapper>
        <ProTable
          headerTitle="数据列表"
          rowKey="id"
          toolBarRender={() => [
            <Button type="primary" onClick={() => this.loadData()}>查询</Button>
          ]}
          search={false}
          dataSource={todoList}
          columns={columns}
          rowSelection={false}
          expandable={false}
          {...this.state}
          pagination={false}
        />
        <Modal
          destroyOnClose
          title="一级可视化图表"
          visible={modalVisible}
          onCancel={() => this.handleModalVisible(false)}
          footer={null}
          width={1300}
        >
          <div id="main" style={{ width: '80%', height: 400 }}>echarts案例</div>
        </Modal>
      </PageHeaderWrapper>);
  }
}
//使用umi的connect方法把命名空间为 visual 的 model 的数据通过 props 传给页面
export default connect(({ visual }) => ({ visual }))(VisualPage);