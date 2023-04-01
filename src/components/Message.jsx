const Message = (props) => {
  const message = props.message;
  const currentUser = props.currentUser;
  const messageUserId = message.user_id;
  const avatar = message.avatar;

  const nextMessage = props.prevMessage;
  const showAvatar = nextMessage ? nextMessage.user_id !== messageUserId : true;

  return currentUser.id !== messageUserId ? (
    showAvatar ? (
      <div className='chat-message their'>
        <img src={avatar} alt='avatar' className='chat-message-avatar' />
        <div className='chat-message-info'>
          <div className='chat-message-header'>
            <div className='chat-message-avatar-username'>
              {message.created_at.substring(11, 16)}
            </div>
          </div>
          <div className='chat-message-body'>{message.body}</div>
        </div>
      </div>
    ) : (
      <div className='current-user chat-message their '>
        <div className='chat-message-info'>
          <div className='chat-message-body'>{message.body}</div>
        </div>
      </div>
    )
  ) : showAvatar ? (
    <div className='chat-message mine'>
      <div className='chat-message-info'>
        <div className='chat-message-header'>
          <div className='chat-message-avatar-username'>01:23</div>

          <div className='chat-message-avatar-time'></div>
        </div>
        <div className='chat-message-body'>ddfdfdsdffd</div>
      </div>
    </div>
  ) : (
    <div className='current-user chat-message mine'>
      <div className='chat-message-info'>
        <div className='chat-message-body'>{message.body}</div>
      </div>
    </div>
  );
};

export default Message;
