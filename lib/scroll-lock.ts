let activeLocks = 0;
let previousOverflow = "";

export function lockPageScroll(): () => void {
  if (activeLocks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  activeLocks++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLocks--;
    if (activeLocks === 0) document.body.style.overflow = previousOverflow;
  };
}