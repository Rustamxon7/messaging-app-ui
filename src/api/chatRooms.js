import axios from '../axios';

const chatRoomsApi = {
  async getChatRooms() {
    try {
      return await axios.get('/chat_rooms');
    } catch (e) {
      return e.response;
    }
  },
  async getChatRoom(id) {
    try {
      return await axios.get(`/chat_rooms/${id}`);
    } catch (e) {
      return e.response;
    }
  },
  async createChatRoom(data) {
    try {
      return await axios.post('/chat_rooms', data);
    } catch (e) {
      return e.response;
    }
  },
  async deleteChatRoom(id) {
    try {
      return await axios.delete(`/chat_rooms/${id}`);
    } catch (e) {
      return e.response;
    }
  },
  async updateChatRoom(id, data) {
    try {
      return await axios.put(`/chat_rooms/${id}`, data);
    } catch (e) {
      return e.response;
    }
  },
  async joinChatRoom(id) {
    try {
      return await axios.post('/join_chat_room', id);
    } catch (e) {
      return e.response;
    }
  },
  async leaveChatRoom(id) {
    try {
      return await axios.post('/leave_chat_room', id);
    } catch (e) {
      return e.response;
    }
  },
  async getChatRoomUsers(id) {
    try {
      return await axios.get(`/chat_rooms/${id}/users_in_chat_room`);
    } catch (e) {
      return e.response;
    }
  },
  async getChatRoomMessages(id, page = 1, perPage = 10) {
    try {
      return await axios.get(`/chat_rooms/${id}/messages?page=${page}&per_page=${perPage}`);
    } catch (e) {
      return e.response;
    }
  },
  async getPrivateChatRoom(id) {
    try {
      return await axios.get(`/private_chat_room/${id}`);
    } catch (e) {
      return e.response;
    }
  },
  async deleteMessage(chatRoomId, id) {
    try {
      return await axios.delete(`/chat_rooms/${id}/messages/${id}`);
    } catch (e) {
      return e.response;
    }
  },
};

export default chatRoomsApi;
