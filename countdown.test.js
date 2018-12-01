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
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('#constructor', () => {
    it('should throw error when called with invalid element', () => {
      expect(() => new Countdown(null)).toThrow(TypeError);
    });
  });

  describe('#start', () => {
    let el, countdown, classListAdd;

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

  describe('#scheduleRender', () => {
    let el, countdown;

    beforeEach(() => {
      el = createElement();
      countdown = new Countdown(el);

      jest.spyOn(Date, 'now');
      jest.spyOn(countdown, 'render');
      jest.spyOn(window, 'clearInterval');
    });

    it('should call setInterval', () => {
      Date.now.mockReturnValue(new Date('2018-12-05').getTime());
      const finalDate = new Date('2018-12-31');

      countdown.scheduleRender(finalDate);
      jest.advanceTimersByTime(1000);

      expect(countdown.render).toHaveBeenCalledWith(finalDate);
    });

    it('should call clearInterval', () => {
      Date.now.mockReturnValue(new Date('2019-01-01').getTime());
      const finalDate = new Date('2018-12-31');

      countdown.scheduleRender(finalDate);
      jest.advanceTimersByTime(1000);

      expect(countdown.render).not.toHaveBeenCalled();
      expect(window.clearInterval).toHaveBeenCalled();
    });
  });

  describe('#fetchFinalDate', () => {
    let el, countdown;

    beforeEach(() => {
      el = createElement();
      countdown = new Countdown(el);

      window.fetch = jest.fn();
      jest.spyOn(el.classList, 'add');
      jest.spyOn(el.classList, 'remove');
    });

    it('should be able to fetch final date from server', done => {
      const finalDate = new Date('2019-01-01').getTime();
      const serverResponse = { finalDate };
      const response = {
        ok: true,
        json: jest.fn().mockReturnValue(Promise.resolve(serverResponse))
      };
      window.fetch.mockReturnValue(Promise.resolve(response));

      countdown.fetchFinalDate().then(finalDateFromServer => {
        expect(el.classList.add).toHaveBeenCalledWith('countdown--loading');
        expect(el.classList.remove).toHaveBeenCalledWith('countdown--error');
        expect(el.classList.remove).toHaveBeenCalledWith('countdown--loading');
        expect(finalDateFromServer.getTime()).toBe(finalDate);

        done();
      });
    });

    it('should return a rejected promise with HTTP Status o error', done => {
      const finalDate = new Date('2019-01-01').getTime();
      const serverResponse = { finalDate };
      const response = {
        ok: false,
        status: 404
      };
      window.fetch.mockReturnValue(Promise.resolve(response));

      countdown.fetchFinalDate().catch(err => {
        expect(el.classList.add).toHaveBeenCalledWith('countdown--loading');
        expect(el.classList.remove).toHaveBeenCalledWith('countdown--error');
        expect(err.message).toBe(`HTTP ${response.status}`);

        done();
      });
    });
  });
});
