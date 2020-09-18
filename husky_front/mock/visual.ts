let list = [
  {
    id: 8,
    title: 'AntD pro v5组件个性化开发',
    status: 0,
  },
  {
    id: 7,
    title: 'AntD pro v5组件学习与使用',
    status: 0,
  },
  {
    id: 6,
    title: 'AntD pro v5开发业务接口',
    status: 0,
  },
  {
    id: 5,
    title: 'AntD pro v5增加菜单',
    status: 1,
  },
  {
    id: 4,
    title: 'AAntD pro v5用户接口后端实现',
    status: 2,
  },
  {
    id: 3,
    title: 'AntD pro v5搭建配置',
    status: 1,
  },
  {
    id: 2,
    title: 'React基础',
    status: 1,
  },
  {
    id: 1,
    title: 'JS基础',
    status: 1,
  },
];
export default {
  'PUT /api/item': (req, res) => {
    let result;
    const item = req.body;
    for (let i = 0; i < list.length; i += 1) {
      if (item.id === list[i].id) {
        list[i] = item;
        result = {
          code: 0,
          message: '操作成功',
          body: true,
        };
        res.send(result);
        return;
      }
    }
    result = {
      code: 404,
      message: '待办事项不存在',
      body: true,
    };
    res.send(result);
  },
  'POST /api/item': (req, res) => {
    const item = { ...req.body, id: list.length + 1 };
    list = [item, ...item];
    const result = {
      code: 0,
      message: '操作成功',
      body: true,
    };
    res.send(result);
  },
  'GET /api/items': (req, res) => {
    console.log('mock data');
    const result = {
      code: 0,
      message: '操作成功',
      body: list,
    };
    res.send(result);
  },
};
