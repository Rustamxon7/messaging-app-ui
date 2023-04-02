import { useState, useEffect, useContext, useRef } from 'react';

import { NavLink, useNavigate } from 'react-router-dom';
import usersApi from '../../api/users';
import chatRoomsApi from '../../api/chatRooms';
import { BiTrashAlt } from 'react-icons/bi';

import './NavLinks.scss';
import { ActionCableContext } from '../..';
import { useSelector } from 'react-redux';
import ReactTimeAgo from 'react-time-ago';
import Loading from '../UI/Loading';
import Button from '../UI/Button';
import ImageComponent from '../UI/Image';
import audio from '../../assets/noti.mp3';
import { UseTitle, useTitle } from '../UI/Title';

const NavLinks = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [receivedData, setReceivedData] = useState([false]);
  const [allUsers, setAllUsers] = useState([]);
  const [channel, setChannel] = useState(null);
  const [currentUserChannel, setCurrentUserChannel] = useState(null);
  const [newChatRoom, setNewChatRoom] = useState(false);
  const [activeChatRoom, setActiveChatRoom] = useState(null);

  const [loading, setLoading] = useState(false);

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const imgRef = useRef();
  const titleRef = useRef();

  const cable = useContext(ActionCableContext);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isLoading = useSelector((state) => state.auth.isLoading);

  const chatRoomsContainer = document.getElementById('chatRooms');

  const [recentChatRoomMessage, setRecentChatRoomMessage] = useState({});

  const navigate = useNavigate();

  const playSound = (notification) => {
    const audio = new Audio(notification);
    audio.play();
  };

  useEffect(() => {
    const channel = cable.subscriptions.create(
      { channel: 'ChatRoomsChannel' },
      {
        received: (data) => {
          setReceivedData(data);
          if (data.status === 'new_message') {
            setRecentChatRoomMessage(data);
            if (data.user_id !== currentUser.id) {
              playSound(audio);
            }
          } else if (data.status === 'created') {
            async function fetchChatRooms() {
              if (data.image !== null) {
                const response = await data.image.url;

                if (response !== null) {
                  setChatRooms((chatRooms) => [...chatRooms, data]);
                }
              }
            }

            fetchChatRooms();
          }
        },
        reject: () => {
          console.log('rejected');
        },
      }
    );

    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [cable.subscriptions, activeChatRoom, currentUser.id, navigate]);

  useEffect(() => {
    const userChannel = cable.subscriptions.create(
      { channel: 'UsersChannel', current_user_id: currentUser.id },
      {
        received: (data) => {
          console.log(data);

          setReceivedData(data);
          if (data.status === 'new_message') {
            setRecentChatRoomMessage(data);
            if (data.user_id !== currentUser.id) {
              playSound(audio);
            }
          } else if (data.status === 'private_room_created') {
            setChatRooms((chatRooms) => [...chatRooms, data]);
          } else if (data.status === 'private_room_deleted') {
            setChatRooms((chatRooms) =>
              chatRooms.filter((chatRoom) => chatRoom.id !== data.id)
            );
          }
        },
        reject: () => {
          console.log('rejected');
        },
      }
    );

    setCurrentUserChannel(userChannel);

    return () => {
      userChannel.unsubscribe();
    };
  }, [cable.subscriptions, activeChatRoom, currentUser.id, navigate]);

  useEffect(() => {
    if (recentChatRoomMessage.status === 'new_message') {
      document.title = `(${recentChatRoomMessage.username}): ${recentChatRoomMessage.body}`;

      setChatRooms((chatRooms) =>
        chatRooms.map((chatRoom) => {
          if (chatRoom.id === recentChatRoomMessage.chat_room_id) {
            return {
              ...chatRoom,
              last_message: recentChatRoomMessage.body,
              last_message_at: recentChatRoomMessage.created_at,
              username: recentChatRoomMessage.username,
            };
          } else {
            return chatRoom;
          }
        })
      );
    }

  }, [recentChatRoomMessage]);

  useEffect(() => {
    if (receivedData.status === 'deleted') {
      console.log('receivedData', receivedData);

      setChatRooms((chatRooms) =>
        chatRooms.filter((chatRoom) => chatRoom.id !== receivedData.id)
      );

      if (activeChatRoom === receivedData.id) {
        navigate('/');
      }
    }
  }, [
    activeChatRoom,
    navigate,
    receivedData,
    receivedData.id,
    receivedData.status,
  ]);

  useEffect(() => {
    const chatRooms = JSON.parse(localStorage.getItem('chatRooms'));

    if (chatRooms && chatRooms.length > 0) {
      setChatRooms(chatRooms);
    } else {
      fetchChatRooms();
    }
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, [newChatRoom]);

  useEffect(() => {
    const resetChatRoomsScroll = () => {
      if (!chatRoomsContainer) return;
      chatRoomsContainer.scrollTop = chatRoomsContainer.scrollHeight;
    };

    resetChatRoomsScroll();
  }, [chatRoomsContainer, receivedData]);

  const fetchChatRooms = async () => {
    setLoading(true);
    const response = await chatRoomsApi.getChatRooms();
    const data = await response.data;
    setChatRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    saveToLocalStorage(chatRooms);
  }, [chatRooms]);

  const saveToLocalStorage = (chatRooms) => {
    localStorage.setItem('chatRooms', JSON.stringify(chatRooms));
  };

  const handleChatRoomSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', imgRef.current.files[0]);
    formData.append('title', titleRef.current.value);

    const respond = await chatRoomsApi.createChatRoom(formData);
    const data = await respond.data;

    channel.send({
      status: 'created',
      ...data,
    });

    // clear form and input
    e.target.reset();
    imgRef.current.value = '';
    titleRef.current.value = '';
  };

  const handleDelete = (chatRoomId) => () => {
    console.log('chatRoomId', chatRoomId);
    channel.send({
      id: chatRoomId,
      status: 'deleted',
    });

    if (activeChatRoom === chatRoomId) {
      navigate('/');
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    const response = await usersApi.getUsers();
    const data = await response.data;
    setAllUsers(data.filter((user) => user.id !== currentUser.id));
    setLoading(false);
  };

  const fetchUser = async (userId, username) => {
    await usersApi.getUser(userId);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <nav className='sidenav'>
      <div className='sidenav-profile'>
        <h2> {currentUser.username}</h2>
        <img src={currentUser.avatar} alt='' className='sidenav-profile__img' />
      </div>
      <div className='chat-rooms' id='chatRooms'>
        {isLoading ? (
          <Loading />
        ) : (
          chatRooms &&
          chatRooms.map((chatRoom) => (
            <NavLink
              to={`/chat_rooms/${chatRoom.id}`}
              className={({ isActive }) =>
                isActive ? 'chat-room active' : 'chat-room'
              }
              key={chatRoom.id}
              onClick={() => setActiveChatRoom(chatRoom.id)}
            >
              {chatRoom.image ? (
                <ImageComponent
                  src={chatRoom.image.url}
                  className='chat-room__img'
                  chatRoomTitle={chatRoom.title}
                />
              ) : (
                <span className='chat-room__img-back'>
                  {chatRoom.title.substring(0, 1)}
                </span>
              )}

              <div className='chat-room__info'>
                <p className='chat-room__name'>
                  {chatRoom.title || chatRoom.username}
                </p>
                <p className='chat-room__last-message'>
                  {chatRoom.last_message ? (
                    <span>
                      {chatRoom.username} :{' '}
                      {chatRoom.last_message.substring(0, 5) + '...'}
                    </span>
                  ) : (
                    'No messages'
                  )}
                </p>
                <p>{chatRoom.messages_count}</p>
              </div>

              <p
                className='chat-room__time'
                onClick={handleDelete(chatRoom.id)}
              >
                <BiTrashAlt size={20} />
              </p>
            </NavLink>
          ))
        )}
        <div
          className='chat-room'
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          CONTACT
        </div>
        {allUsers.map((user) => (
          <div className='chat-room' key={user.id}>
            {user.username}

            <Button
              children={'chat'}
              onClick={() => {
                fetchUser(user.id, user.username);
              }}
            />
          </div>
        ))}
      </div>

      <form className='sidenav-search' onSubmit={handleChatRoomSubmit}>
        <input type='text' placeholder='Search' ref={titleRef} />
        <input type='file' ref={imgRef} />
        <button type='submit'>
          <ion-icon name='search-outline'></ion-icon>
        </button>
      </form>
    </nav>
  );
};

export default NavLinks;
