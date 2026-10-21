export const distance = (vecA, vecB) => {
  let total = 0;
  for (let i = 0; i < vecA.length; i++) {
    total += (vecA[i] - vecB[i]) * (vecA[i] - vecB[i]);
  }
  return total;
};