export const shuffleArray = array => array
  .map((value) => ({ value, sort: Math.random() })) // assign a random number to each element
  .sort((a, b) => a.sort - b.sort)                  // sort by those numbers
  .map(({ value }) => value);                       // return array without random numbers
