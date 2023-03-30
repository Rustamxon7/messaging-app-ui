export const connecting = (ws, channel) => {
  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({
          channel: channel,
        }),
      })
    );
  };
};
