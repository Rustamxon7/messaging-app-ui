import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import './Loading.css';

import spinner from '../../assets/spinner.svg';

function Loading(loading) {
  const tl = gsap.timeline();

  useLayoutEffect(() => {
    tl.fromTo(
      '.loading',
      { rotate: 0 },
      { rotate: 360, duration: 1, repeat: -1 }
    );

    return () => {
      tl.kill();
    };
  }, [tl]);

  return (
    <div className='loading'>
      <img
        src={spinner}
        alt='RasmgaOl logo'
        style={{ width: '20%', height: '20%' }}
      />
    </div>
  );
}

export function Spinner() {
  const tl = gsap.timeline();

  useLayoutEffect(() => {
    tl.fromTo(
      '.create-overlay__icon',
      { rotate: 0 },
      { rotate: 360, duration: 1, repeat: -1 }
    );

    return () => {
      tl.kill();
    };
  }, [tl]);

  return (
    <div className='create-overlay__icon'>
      <img src={spinner} alt='spinner' />
    </div>
  );
}

export function Breathing() {
  return (
    <div className='container'>
      <div className='outerring'>
        <div className='innerring'></div>
      </div>
    </div>
  );
}

export default Loading;
