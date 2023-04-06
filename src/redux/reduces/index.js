import { combineReducers } from 'redux';
import authReducer from './authReducer';
import chatRoomReducer from './chatRoomReducer';

export default combineReducers({
  auth: authReducer,
  chatRooms: chatRoomReducer,
});
