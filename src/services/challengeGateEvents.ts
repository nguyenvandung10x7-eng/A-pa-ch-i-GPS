export const CHALLENGE_GATE_RESET_EVENT = 'book-of-dien-bien:challenge-gate-reset';

export const requestChallengeGateReset = (): void => {
  window.dispatchEvent(new Event(CHALLENGE_GATE_RESET_EVENT));
};
