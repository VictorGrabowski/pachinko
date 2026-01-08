// Utility helper functions
export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const lerp = (start, end, t) => {
  return start + (end - start) * t;
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// Wabi-sabi jitter for organic feel
export const applyWabiSabi = (value, jitterAmount = 3) => {
  return value + randomBetween(-jitterAmount, jitterAmount);
};

// Format score with commas
export const formatScore = (score) => {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
