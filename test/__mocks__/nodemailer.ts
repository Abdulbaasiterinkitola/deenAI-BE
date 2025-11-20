export const createTransport = jest.fn().mockReturnValue({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
});

export default {
  createTransport,
};
