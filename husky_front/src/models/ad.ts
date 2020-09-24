import { fetchADUserList } from '@/services/ad';
import { message } from 'antd';

export default {
  namespace: 'ad',
  state: {
    ADUserList: [],
    loading: true, // 表格加载标记，初始化值为true
  },
  effects: {
    *fetchADUserList({ payload }, { call, put }) {
      console.log('model-effects-fetchADUserList');
      const response = yield call(fetchADUserList, payload);
      if (response.code === 0) {
        yield put({
          type: 'setUserList',
          payload: response.body,
        });
      } else {
        message.error(response.message);
        yield put({
          type: 'setUserList',
          payload: [],
        });
      }
    },
  },
  reducers: {
    setUserList(state, action) {
      return {
        ...state,
        ADUserList: action.payload,
        loading: false, // 表格加载标记，数据载入完毕设为false
      };
    },
  },
};
