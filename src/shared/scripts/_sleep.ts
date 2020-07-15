export const sleep: (num: number) => Promise<unknown> = (
  num: number
): Promise<unknown> => {
  return new Promise((resolve: (value?: unknown) => void) => {
    setTimeout(() => resolve(), num);
  });
};
