import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';

const Error = ({ errors, login }) => {
  const errorMessages = errors.split(/\.|and/).filter((error) => error);

  console.log(errorMessages);

  return (
    <ul className='errors'>
      {errorMessages.map((errorMessage, index) => (
        <li className={login} key={index}>{errorMessage}</li>
      ))}
    </ul>
  );
};

export default Error;
