import React, { Component } from 'react';

class ImageComponent extends Component {
  state = {
    loaded: false,
    error: false,
  };

  componentDidMount() {
    const img = new Image();
    img.onload = () => {
      this.setState({ loaded: true });
    };
    img.src = this.props.src;

    img.onerror = () => {
      this.setState({ error: true });
    };

    img.src = this.props.src;
  }

  render() {
    const { src, className, chatRoomTitle } = this.props;
    const { loaded } = this.state;

    return loaded && src ? (
      <img src={src} className={className} alt='chat room' />
    ) : (
      <span className='chat-room__img-back'>
        {chatRoomTitle.substring(0, 1).toUpperCase()}
      </span>
    );
  }
}

export default ImageComponent;
