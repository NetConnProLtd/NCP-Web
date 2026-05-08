function initSlotMachine(words) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slotMachine = document.querySelector(".slot-machine");
  if (!slotMachine) return;

  const track = slotMachine.querySelector(".slot-machine__track");
  const startWord = "dreams";
  let index = words.indexOf(startWord);
  if (index === -1) index = 0;

  const repetitions = 6;
  const extendedWords = Array.from({ length: repetitions }, () => words).flat();
  track.innerHTML = extendedWords.map((word) => `<span>${word}</span>`).join("");

  const setIndex = (nextIndex, animate) => {
    track.style.transition = animate
      ? "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      : "none";
    track.style.transform = `translateY(${-nextIndex}em)`;
  };

  let position = index;
  setIndex(position, false);

  if (prefersReducedMotion) return;

  let spinTimerId;
  let remainingTargets = [...words.keys()];

  const scheduleNextSpin = () => {
    spinTimerId = window.setTimeout(spinOnce, 2400 + Math.random() * 2000);
  };

  const spinOnce = () => {
    if (remainingTargets.length === 0) remainingTargets = [...words.keys()];

    if (position > words.length * (repetitions - 2)) {
      position = (position % words.length) + words.length;
      setIndex(position, false);
    }

    const pickIndex = Math.floor(Math.random() * remainingTargets.length);
    const target = remainingTargets.splice(pickIndex, 1)[0];
    const current = position % words.length;
    const delta = (target - current + words.length) % words.length;
    const cycles = 2 + Math.floor(Math.random() * 2);
    const totalSteps = cycles * words.length + delta;
    const finalIndex = position + totalSteps;
    const duration = Math.max(900, totalSteps * 110);
    let fallbackTimerId;

    const onSpinEnd = () => {
      track.removeEventListener("transitionend", onSpinEnd);
      if (fallbackTimerId) window.clearTimeout(fallbackTimerId);
      position = finalIndex;
      scheduleNextSpin();
    };

    track.addEventListener("transitionend", onSpinEnd);
    track.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    track.style.transform = `translateY(${-finalIndex}em)`;
    fallbackTimerId = window.setTimeout(onSpinEnd, duration + 120);
  };

  const restart = () => {
    if (spinTimerId) window.clearTimeout(spinTimerId);
    position = position % words.length;
    setIndex(position, false);
    window.requestAnimationFrame(spinOnce);
  };

  restart();

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) restart();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) restart();
  });
  window.addEventListener("focus", restart);
}
