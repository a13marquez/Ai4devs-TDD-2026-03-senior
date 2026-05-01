describe('Example Test', () => {
  test('should work with TypeScript', () => {
    const sum = (a: number, b: number): number => a + b;
    expect(sum(2, 3)).toBe(5);
  });

  test('should handle async code', async () => {
    const asyncFn = (): Promise<string> => Promise.resolve('test');
    await expect(asyncFn()).resolves.toBe('test');
  });
});
