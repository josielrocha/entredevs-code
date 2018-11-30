import Countdown from './countdown';

const createElement = () => {
  const template = [
    '<section class="countdown">',
    '<h1 class="countdown__title">Restam apenas:</h1>',
    '<div class="countdown__display"></div>',
    '</section>'
  ].join('');

  const el = document.createElement('div');
  el.insertAdjacentHTML('beforeend', template);
  return el.firstChild;
};

describe('Countdown', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('#constructor', () => {
    it('should throw error when called with invalid element', () => {
      expect(() => new Countdown(null)).toThrow(TypeError);
    });
  });

  describe('#start', () => {
    let el;
    let countdown;
    let classListAdd;

    beforeEach(() => {
      el = createElement();
      countdown = new Countdown(el);

      jest.spyOn(el.classList, 'add');
      jest.spyOn(countdown, 'fetchFinalDate');
      jest.spyOn(countdown, 'scheduleRender');
    });

    it('should call console.error on fail calling fetchFinalDate', done => {
      const error = new Error('Runtime error');
      countdown.fetchFinalDate.mockImplementation(() => Promise.reject(error));

      countdown.start().then(() => {
        expect(console.error).toHaveBeenCalledWith(error);
        expect(el.classList.add).toHaveBeenCalledWith('countdown--error');
        done();
      });
    });

    it('should call scheduleRender after fetch final date', done => {
      const finalDate = new Date('2018-12-31 23:59:59');
      countdown.fetchFinalDate.mockImplementation(() =>
        Promise.resolve(finalDate)
      );

      countdown.start().then(finalDate => {
        expect(countdown.scheduleRender).toHaveBeenCalled(finalDate);
        done();
      });
    });
  });
});
