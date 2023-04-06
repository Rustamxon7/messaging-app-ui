function Form(props) {
  const isPrivate = props.isPrivate;
  const isUserMember = props.isUserMember;
  const handleJoin = props.handleJoin;
  const handleSubmit = props.handleSubmit;
  const inputValue = props.inputValue;
  const setInputValue = props.setInputValue;

  return (
    <>
      {!isPrivate && !isUserMember ? (
        <div className='chat__footer' onClick={handleJoin}>
          <div className='chat__footer-container'>
            <p>You are not a member of this chat room</p>
          </div>
        </div>
      ) : (
        <form className='chat__footer' onSubmit={handleSubmit}>
          <div className='chat__footer-container'>
            <input
              type='text'
              placeholder='Type a message'
              name='message'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className='chat__footer-button' type='submit'>
              <ion-icon name='send'></ion-icon>
            </button>
          </div>
        </form>
      )}
    </>
  );
}

export default Form;
