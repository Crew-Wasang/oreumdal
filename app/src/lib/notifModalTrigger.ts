let _pending = false;

export const triggerNotifOpen = () => { _pending = true; };
export const consumeNotifTrigger = () => {
  const val = _pending;
  _pending = false;
  return val;
};
