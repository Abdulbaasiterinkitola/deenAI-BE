// Mock UUID module to avoid ES module issues
export const v4 = jest.fn(() => 'mock-uuid-v4');
export const v1 = jest.fn(() => 'mock-uuid-v1');
export const validate = jest.fn(() => true);
export const version = jest.fn(() => 4);

export default {
  v4,
  v1,
  validate,
  version,
};