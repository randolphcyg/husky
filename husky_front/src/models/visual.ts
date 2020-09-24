import { getAll } from '@/services/visual';
import { message } from 'antd';

export default {
  namespace: 'visual',
  state: {
    bugList: [],
    loading: true, // 表格加载标记，初始化值为true
    modalVisible: false,
  },
  effects: {
    *fetchBugList({ payload }, { call, put }) {
      console.log('model-effects-fetchBugList');
      const response = yield call(getAll, payload);
      if (response.code === 0) {
        yield put({
          type: 'setBugList',
          payload: response.body,
        });
      } else {
        message.error(response.message);
        yield put({
          type: 'setBugList',
          payload: [],
        });
      }
    },
  },
  reducers: {
    setBugList(state, action) {
      return {
        ...state,
        bugList: action.payload,
        loading: false, // 表格加载标记，加载完成设为false
      };
    },
  },
};
