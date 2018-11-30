import Countdown from './countdown';

describe('Countdown', () => {
  describe('#constructor', () => {
    it('Should throw error when called with invalid element', () => {
      expect(() => new Countdown(null)).toThrow(TypeError);
    });
  });
});
