import { useState, useEffect, useContext, useRef } from 'react';

import { NavLink, useNavigate, useParams } from 'react-router-dom';
import usersApi from '../../api/users';

import './NavLinks.scss';
import { ActionCableContext } from '../..';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../UI/Loading';
import Button from '../UI/Button';
import ImageComponent from '../UI/Image';
import audio from '../../assets/noti.mp3';
import { getChatRooms } from '../../redux/actions/chat';

const NavLinks = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [receivedData, setReceivedData] = useState([false]);
  const [allUsers, setAllUsers] = useState([]);
  const [channel, setChannel] = useState(null);

  const cable = useContext(ActionCableContext);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const reduxChatRooms = useSelector((state) => state.chatRooms.chatRooms);

  const activeChatRoom = Number(useParams().id);

  const [loading, setLoading] = useState(false);

  const titleRef = useRef();

  const dispatch = useDispatch();

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
            if (!reduxChatRooms.find((chatRoom) => chatRoom.id === data.id)) {
              dispatch(getChatRooms());
            }
          } else if (data.status === 'deleted') {
            setChatRooms((chatRooms) =>
              chatRooms.filter((chatRoom) => chatRoom.id !== data.id)
            );
          }
        },
      }
    );

    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [cable.subscriptions, activeChatRoom, currentUser.id]);

  useEffect(() => {
    const userChannel = cable.subscriptions.create(
      { channel: 'UsersChannel', current_user_id: currentUser.id },
      {
        received: (data) => {
          setReceivedData(data);
          if (data.status === 'new_message') {
            setRecentChatRoomMessage(data);

            if (data.user_id !== currentUser.id) {
              playSound(audio);
            }
          } else if (data.status === 'private_room_created') {
            setChatRooms((chatRooms) => chatRooms.unshift(data));
          } else if (data.status === 'private_room_deleted') {
            setChatRooms((chatRooms) =>
              chatRooms.filter((chatRoom) => chatRoom.id !== data.id)
            );
          }
        },
      }
    );

    return () => {
      userChannel.unsubscribe();
    };
  }, [cable.subscriptions, activeChatRoom, currentUser.id, navigate]);

  useEffect(() => {
    if (recentChatRoomMessage.status === 'new_message') {
      document.title = `(${recentChatRoomMessage.username}): ${recentChatRoomMessage.body}`;

      setChatRooms((chatRooms) => {
        const updatedChatRooms = chatRooms.map((chatRoom) => {
          if (chatRoom.id === recentChatRoomMessage.chat_room_id) {
            return {
              ...chatRoom,
              last_message: recentChatRoomMessage.body,
              last_message_at: recentChatRoomMessage.created_at,
              username: recentChatRoomMessage.username,
              unread_messages_count: chatRoom.unread_messages_count + 1,
            };
          } else {
            return chatRoom;
          }
        });

        const chatRoom = updatedChatRooms.find(
          (chatRoom) => chatRoom.id === recentChatRoomMessage.chat_room_id
        );

        const filteredChatRooms = updatedChatRooms.filter(
          (chatRoom) => chatRoom.id !== recentChatRoomMessage.chat_room_id
        );

        return [chatRoom, ...filteredChatRooms];
      });
    }
  }, [recentChatRoomMessage]);

  useEffect(() => {
    if (recentChatRoomMessage.chat_room_id === activeChatRoom) {
      setChatRooms((chatRooms) =>
        chatRooms.map((chatRoom) => {
          if (chatRoom.id === recentChatRoomMessage.chat_room_id) {
            return {
              ...chatRoom,
              unread_messages_count: 0,
            };
          } else {
            return chatRoom;
          }
        })
      );
    }
  }, [activeChatRoom, recentChatRoomMessage]);

  useEffect(() => {
    setChatRooms((chatRooms) =>
      chatRooms.map((chatRoom) => {
        if (chatRoom.id === activeChatRoom) {
          return {
            ...chatRoom,
            unread_messages_count: 0,
          };
        } else {
          return chatRoom;
        }
      })
    );
  }, [activeChatRoom]);

  useEffect(() => {
    if (receivedData.status === 'deleted') {
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
    dispatch(getChatRooms());
  }, [dispatch]);

  useEffect(() => {
    reduxChatRooms.sort((a, b) => {
      if (a.created_at < b.created_at) {
        return -1;
      } else if (a.created_at > b.created_at) {
        return 1;
      } else {
        return 0;
      }
    });

    setChatRooms(reduxChatRooms);
  }, [reduxChatRooms]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const resetChatRoomsScroll = () => {
      if (!chatRoomsContainer) return;
      chatRoomsContainer.scrollTop = 0;
    };

    resetChatRoomsScroll();
  }, [chatRoomsContainer, receivedData]);

  const handleDelete = (chatRoomId) => () => {
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

  return (
    <nav className='sidenav'>
      <div to={'/settings'} className='sidenav-profile'>
        <NavLink to={'/settings'} className='sidenav-profile__info'>
          <ImageComponent
            src={currentUser.avatar}
            className='sidenav-profile__img'
            chatRoomTitle={currentUser.username}
          />

          <h2>{currentUser.username}</h2>
        </NavLink>

        <NavLink to='/chat_rooms/new' className='sidenav-profile__add'>
          <ion-icon name='add-outline'></ion-icon>
        </NavLink>
      </div>

      <div className='chat-rooms' id='chatRooms'>
        {isLoading || loading ? (
          <Loading />
        ) : (
          chatRooms &&
          chatRooms.map((chatRoom, index) => (
            <NavLink
              to={`/chat_rooms/${chatRoom.id}`}
              className={({ isActive }) =>
                isActive ? 'chat-room active' : 'chat-room'
              }
              key={index}
              onClick={handleDelete(chatRoom.id)}
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
                    ''
                  )}
                </p>
              </div>

              {chatRoom.unread_messages_count === 0 ? (
                ''
              ) : (
                <p className='chat-room__time'>
                  {chatRoom.unread_messages_count}
                </p>
              )}
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

      {/* <form className='sidenav-search'>
        <input type='text' placeholder='Search' ref={titleRef} />
        <ion-icon name='search-outline'></ion-icon>
      </form> */}
    </nav>
  );
};

export default NavLinks;
