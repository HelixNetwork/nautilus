export const __DEV__ = process.env.NODE_ENV === 'development';
export const __TEST__ = process.env.NODE_ENV === 'test';
export const defaultNode = __TEST__ ? 'http://localhost:14265' : 'http://localhost:14265';