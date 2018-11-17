const EMPTY_STRING = '';
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export default class Countdown {
  constructor(element, options) {
    if (!HTMLElement.prototype.isPrototypeOf(element)) {
      throw new TypeError('Element must be an HTMLElement');
    }

    this._element = element;
    this._options = Object.assign({}, Countdown.DEFAULTS, options);

    const { displaySelector } = this._options;
    this._display = this._element.querySelector(displaySelector);
  }

  start() {
    const { errorClassName } = this._options;

    this.fetchFinalDate()
      .catch(err => {
        this._element.classList.add(errorClassName);
        console.error(err);
      })
      .then(finalDate => this.scheduleRender(finalDate));
  }

  scheduleRender(finalDate) {
    this._timer = setInterval(() => {
      if (Date.now() > finalDate) {
        clearInterval(this._timer);
        return;
      }

      this.render(finalDate);
    }, SECOND);
  }

  render(finalDate) {
    const { numberTemplate, colonTemplate } = this._options;
    const info = this.getRemainingInfo(finalDate);
    const html = Object.keys(info)
      .map(key =>
        String(info[key])
          .padStart(2, '0')
          .split(EMPTY_STRING)
          .map(number =>
            numberTemplate.replace('%s', number).replace('%d', number)
          )
          .join(EMPTY_STRING)
      )
      .join(colonTemplate);

    requestAnimationFrame(() => {
      this._display.innerHTML = '';
      this._display.insertAdjacentHTML('afterbegin', html);
    });
  }

  fetchFinalDate() {
    const { classList } = this._element;
    const { finalDatePath, errorClassName, loadingClassName } = this._options;

    classList.remove(errorClassName);
    classList.add(loadingClassName);
    return fetch(finalDatePath)
      .then(response => {
        classList.remove(loadingClassName);

        if (response.ok) {
          return response.json();
        }

        return Promise.reject(new Error(`HTTP ${response.status}`));
      })
      .then(({ finalDate }) => new Date(finalDate));
  }

  getRemainingInfo(finalDate) {
    const now = Date.now();

    let milisecondsRemaining = finalDate - now;
    const days = Math.floor(milisecondsRemaining / DAY);
    milisecondsRemaining %= DAY;

    const hours = Math.floor(milisecondsRemaining / HOUR);
    milisecondsRemaining %= HOUR;

    const minutes = Math.floor(milisecondsRemaining / MINUTE);
    milisecondsRemaining %= MINUTE;

    const seconds = Math.floor(milisecondsRemaining / SECOND);

    return {
      days,
      hours,
      minutes,
      seconds
    };
  }

  static get DEFAULTS() {
    return {
      numberTemplate:
        '<span class="countdown__number countdown__number--%s">%d</span>',
      colonTemplate: '<span class="countdown__colon">:</span>',
      displaySelector: '.countdown__display',
      finalDatePath: '/api/v1/countdown.json',
      loadingClassName: 'countdown--loading',
      errorClassName: 'countdown--error'
    };
  }
}
