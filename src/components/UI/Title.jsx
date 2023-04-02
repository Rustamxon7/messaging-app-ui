import { useEffect } from 'react';

export function UseTitle(title) {
  useEffect(() => {
    console.log('title', title);
    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  });
}
