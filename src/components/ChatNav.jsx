import { useState, useEffect } from 'react';
import Button from './UI/Button';
import ImageComponent from './UI/Image';
import Image from './UI/Image';

function ChatNav(props) {

  const handleJoin = props.handleJoin;
  const handleLeave = props.handleLeave;
  const currentlyTyping = props.currentlyTyping;

  const [loading, setLoading] = useState(true);
  const [currentChatRoom, setCurrentChatRoom] = useState({});

  useEffect(() => {
    setLoading(false);
    setCurrentChatRoom(props.currentChatRoom);
  }, [props.currentChatRoom]);

  return (
    <>
      {loading ? (
        <div className='chat-nav'>
          <div className='chat-nav__loading'>
            <div className='lds-ellipsis'>
              <div></div>
            </div>
          </div>
        </div>
      ) : (
        <div className='dashboard-top'>
          <div className='top-chat__profile'>
            <div className='top-chat__profile-info'>
              {currentChatRoom.image ? (
                <ImageComponent
                  src={currentChatRoom.image.url}
                  className='top-chat__profile__img'
                  chatRoomTitle={currentChatRoom.title}
                />
              ) : (
                <Image
                  src=''
                  className='top-chat__profile__img'
                  chatRoomTitle={currentChatRoom.title}
                />
              )}

              <div>
                <p className='top-chat__profile__name'>
                  {currentChatRoom.title}
                </p>
                <br />
                {!currentChatRoom.is_private ? (
                  <p className='top-chat__profile__members'>
                    {currentChatRoom.users_count} members
                  </p>
                ) : (
                  <p className='top-chat__profile__members'>private</p>
                )}
              </div>

              <div className='top-chat__profile__typing'>
                {currentlyTyping.map((user) => (
                  <p>{user} is typing...</p>
                ))}
              </div>
            </div>

            <div className='top-chat__profile__btns'>
              {!currentChatRoom.is_private &&
                (!currentChatRoom.members.includes(props.currentUser.id) ? (
                  <Button
                    children={'Join'}
                    onClick={handleJoin}
                    className={'top-chat__profile__btn'}
                  />
                ) : (
                  <Button
                    children={'Leave'}
                    onClick={handleLeave}
                    className={'top-chat__profile__btn'}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatNav;
