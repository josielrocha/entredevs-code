import Countdown from './countdown.js';

const element = document.querySelector('.countdown');
const countdown = new Countdown(element);
countdown.start();
