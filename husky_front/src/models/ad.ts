import { fetchADUserList } from '@/services/ad';
import { message } from 'antd';

export default {
  namespace: 'ad',
  state: {
    ADUserList: [],
  },
  effects: {
    *fetchADUserList({ payload }, { call, put }) {
      console.log('model-effects-fetchADUserList');
      
      const response = yield call(fetchADUserList, payload);
      console.log(response.body)
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
      };
    },
  },
};
