import { useState, useEffect, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionCableContext } from '..';
import chatRoomsApi from '../api/chatRooms';
import ChatNav from './ChatNav';
import Form from './Form';
import { Breathing } from './UI/Loading';
import Message from './Message';
import './Dashboard.scss';
import { getChatRooms, updateChatRoom } from '../redux/actions/chat';

function MyChat() {
  const messagesContainer = document.querySelector('.dashboard-bottom');

  const { id } = useParams();
  const navigate = useNavigate();
  const typingUsers = useRef([]);
  const count = useRef(0);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const reduxChatRoom = useSelector((state) =>
    state.chatRooms.chatRooms.find((chatRoom) => chatRoom.id === Number(id))
  );

  const dispatch = useDispatch();

  const cable = useContext(ActionCableContext);
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [receivedData, setReceivedData] = useState({});
  const [currentlyTyping, setCurrentlyTyping] = useState([]);
  const [currentChatRoom, setCurrentChatRoom] = useState(null);

  useEffect(() => {
    if (reduxChatRoom) {
      setCurrentChatRoom(reduxChatRoom);
      setIsPrivate(reduxChatRoom.is_private);
      setIsJoined(reduxChatRoom.is_member);
    }
  }, [reduxChatRoom]);

  useEffect(() => {
    const channel = cable.subscriptions.create({
      channel: 'MessagesChannel',
      id,
      current_user_id: currentUser.id,
    });

    setChannel(channel);

    fetchMessages(id, 1, 105);

    return () => {
      channel.unsubscribe();
    };
  }, [cable.subscriptions, currentUser.id, id]);

  useEffect(() => {
    const resetScroll = () => {
      if (!messagesContainer) return;

      window.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth',
      });
    };

    resetScroll();
  }, [id, messages, messagesContainer]);

  useEffect(() => {
    if (channel) {
      channel.received = (data) => {
        setReceivedData(data);
      };
    }
  }, [channel, currentUser.id, id]);

  useEffect(() => {
    if (!currentChatRoom) return;

    if (receivedData.status === `subscribed_to_${id}`) {
      if (currentChatRoom) {
        let newChatRoom = {
          id: currentChatRoom.id,
          is_member: receivedData.members.includes(currentUser.id),
          users_count: receivedData.members.length,
          title: currentChatRoom.title,
          image: currentChatRoom.image,
          is_private: currentChatRoom.is_private,
          members: receivedData.members,
        };

        setCurrentChatRoom(newChatRoom);
      }

      setIsJoined(receivedData.is_joined);

      setIsPrivate(receivedData.is_private);
    }
  }, [receivedData]);

  useEffect(() => {
    if (receivedData.status === 'typing') {
      typingUsers.current = [...typingUsers.current, receivedData.username];

      const filteredUsers = filterTypingUsers(typingUsers.current);

      setCurrentlyTyping(filteredUsers);
    } else if (receivedData.status === 'stopped_typing') {
      typingUsers.current = typingUsers.current.filter(
        (user) => user !== receivedData.username
      );

      const filteredUsers = filterTypingUsers(typingUsers.current);

      setCurrentlyTyping(filteredUsers);
    }

    // ----------------------------

    if (receivedData.status === `created`) {
      setMessages((messages) => [...messages, receivedData]);
    } else if (receivedData.status === `deleted`) {
      setMessages((messages) =>
        messages.filter((message) => message.id !== receivedData.id)
      );
    } else if (receivedData.status === `updated`) {
      setMessages((messages) =>
        messages.map((message) => {
          if (message.id === receivedData.id) {
            return receivedData;
          }
          return message;
        })
      );
    }
  }, [receivedData]);

  useEffect(() => {
    if (count.current === 0) {
      count.current = 1;
      return;
    }

    if (inputValue.length >= 0) {
      channel.send({
        user_id: currentUser.id,
        chat_room_id: id,
        is_private: isPrivate,
        username: currentUser.username,
        status: 'typing',
      });
    }

    const timeout = setTimeout(() => {
      channel.send({
        user_id: currentUser.id,
        chat_room_id: id,
        is_private: isPrivate,
        username: currentUser.username,
        status: 'stopped_typing',
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [inputValue]);

  const filterTypingUsers = (users) => {
    const filteredUsers = users.filter(
      (user, index) => users.indexOf(user) === index
    );

    return filteredUsers;
  };

  const [loading, setLoading] = useState(false);

  const fetchMessages = async (id, page, perPage) => {
    setLoading(true);
    const response = await chatRoomsApi.getChatRoomMessages(id, page, perPage);
    setMessages(response.data);
    setLoading(false);
  };

  const handleDelete = (chatRoomId, messageId) => async () => {
    channel.send({
      id: messageId,
      chat_room_id: chatRoomId,
      status: 'deleted',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = e.target.message.value;
    const date = new Date();
    const dateAsString = date.toISOString();
    const timezone = date.getTimezoneOffset();
    const created_at = `${dateAsString} ${timezone}`;
    e.target.message.value = '';

    channel.send({
      body,
      chat_room_id: id,
      user_id: currentUser.id,
      status: 'created',
      avatar: currentUser.avatar,
      created_at,
    });

    setInputValue('');

    channel.send({
      user_id: currentUser.id,
      chat_room_id: id,
      is_private: isPrivate,
      status: 'stopped_typing',
    });
  };

  const handleJoin = async () => {
    const data = {
      user_id: currentUser.id,
      chat_room_id: id,
      status: 'joined',
    };

    channel.send(data);

    setCurrentChatRoom((chatRoom) => ({
      ...chatRoom,
      users_count: chatRoom.users_count + 1,
      is_member: true,
      is_joined: true,
    }));
  };

  const handleLeave = async () => {
    const data = {
      user_id: currentUser.id,
      body: `${currentUser.username} left the chat room`,
      chat_room_id: id,
      status: 'left_chat_room',
    };

    channel.send(data);
    navigate(`/`);

    setCurrentChatRoom((chatRoom) => ({
      ...chatRoom,
      users_count: chatRoom.users_count - 1,
      is_member: false,
      is_joined: false,
    }));
  };

  return (
    <section className='dashboard'>
      {currentChatRoom && (
        <ChatNav
          currentChatRoom={currentChatRoom}
          isJoined={isJoined}
          handleJoin={handleJoin}
          handleLeave={handleLeave}
          currentlyTyping={currentlyTyping}
          currentUser={currentUser}
        />
      )}

      <div></div>

      <div className='dashboard-bottom'>
        {loading ? (
          <Breathing className='chat-messages' />
        ) : (
          <div className='chat-messages'>
            {messages.map((message, index) => (
              <Message
                key={index}
                message={message}
                username={message.username}
                user_id={message.user_id}
                avatar={message.avatar}
                currentUser={currentUser}
                handleDelete={handleDelete}
                prevMessage={messages[messages.indexOf(message) - 1]}
              />
            ))}
          </div>
        )}
      </div>

      <div></div>

      {currentChatRoom && (
        <Form
          isPrivate={currentChatRoom.is_private}
          isUserMember={currentChatRoom.is_member}
          isJoined={isJoined}
          setInputValue={setInputValue}
          inputValue={inputValue}
          handleSubmit={handleSubmit}
        />
      )}
    </section>
  );
}

export default MyChat;
