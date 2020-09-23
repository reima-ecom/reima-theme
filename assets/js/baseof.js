import { l as loadElement } from './load-element-b03c5bd5.js';

function e({modulePath:e=".",importFunctionName:t="__import__"}={}){try{self[t]=new Function("u","return import(u)");}catch(o){const r=new URL(e,location),n=e=>{URL.revokeObjectURL(e.src),e.remove();};self[t]=e=>new Promise((o,a)=>{const c=new URL(e,r);if(self[t].moduleMap[c])return o(self[t].moduleMap[c]);const l=new Blob([`import * as m from '${c}';`,`${t}.moduleMap['${c}']=m;`],{type:"text/javascript"}),m=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(l),onerror(){a(new Error(`Failed to import: ${e}`)),n(m);},onload(){o(self[t].moduleMap[c]),n(m);}});document.head.appendChild(m);}),self[t].moduleMap={};}}var t=Object.freeze({initialize:e});

var t$1,n,e$1=function(){return "".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12)},i=function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1;return {name:t,value:n,delta:0,entries:[],id:e$1(),isFinal:!1}},a=function(t,n){try{if(PerformanceObserver.supportedEntryTypes.includes(t)){var e=new PerformanceObserver((function(t){return t.getEntries().map(n)}));return e.observe({type:t,buffered:!0}),e}}catch(t){}},r=!1,o=!1,s=function(t){r=!t.persisted;},u=function(){addEventListener("pagehide",s),addEventListener("beforeunload",(function(){}));},c=function(t){var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];o||(u(),o=!0),addEventListener("visibilitychange",(function(n){var e=n.timeStamp;"hidden"===document.visibilityState&&t({timeStamp:e,isUnloading:r});}),{capture:!0,once:n});},l=function(t,n,e,i){var a;return function(){e&&n.isFinal&&e.disconnect(),n.value>=0&&(i||n.isFinal||"hidden"===document.visibilityState)&&(n.delta=n.value-(a||0),(n.delta||n.isFinal||void 0===a)&&(t(n),a=n.value));}},p=function(t){var n,e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r=i("CLS",0),o=function(t){t.hadRecentInput||(r.value+=t.value,r.entries.push(t),n());},s=a("layout-shift",o);s&&(n=l(t,r,s,e),c((function(t){var e=t.isUnloading;s.takeRecords().map(o),e&&(r.isFinal=!0),n();})));},d=function(){return void 0===t$1&&(t$1="hidden"===document.visibilityState?0:1/0,c((function(n){var e=n.timeStamp;return t$1=e}),!0)),{get timeStamp(){return t$1}}},f=function(t){var n=i("FID"),e=d(),r=function(t){t.startTime<e.timeStamp&&(n.value=t.processingStart-t.startTime,n.entries.push(t),n.isFinal=!0,s());},o=a("first-input",r),s=l(t,n,o);o?c((function(){o.takeRecords().map(r),o.disconnect();}),!0):window.perfMetrics&&window.perfMetrics.onFirstInputDelay&&window.perfMetrics.onFirstInputDelay((function(t,i){i.timeStamp<e.timeStamp&&(n.value=t,n.isFinal=!0,n.entries=[{entryType:"first-input",name:i.type,target:i.target,cancelable:i.cancelable,startTime:i.timeStamp,processingStart:i.timeStamp+t}],s());}));},m=function(){return n||(n=new Promise((function(t){return ["scroll","keydown","pointerdown"].map((function(n){addEventListener(n,t,{once:!0,passive:!0,capture:!0});}))}))),n},g=function(t){var n,e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r=i("LCP"),o=d(),s=function(t){var e=t.startTime;e<o.timeStamp?(r.value=e,r.entries.push(t)):r.isFinal=!0,n();},u=a("largest-contentful-paint",s);if(u){n=l(t,r,u,e);var p=function(){r.isFinal||(u.takeRecords().map(s),r.isFinal=!0,n());};m().then(p),c(p,!0);}};

function sendToAnalytics({ name, value, id }) {
  const body = JSON.stringify({
    name,
    value,
    id,
    timestamp: new Date(),
    page: window.location.pathname,
    host: window.location.hostname,
    experiment: window.experiment,
  });
  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  const url = 'https://us.reima.com/api/rum';
  if (navigator.sendBeacon) navigator.sendBeacon(url, body);
  else fetch(url, { body, method: 'POST', keepalive: true });
}

p(sendToAnalytics);
f(sendToAnalytics);
g(sendToAnalytics);

t.initialize({ modulePath: '/' });

if (document.querySelector('r-carousel')) loadElement('r-carousel');
if (document.querySelector('r-thumbnails')) loadElement('r-thumbnails');
// eslint-disable-next-line no-unused-expressions
if (document.forms.namedItem('subscribe')) __import__('./r-subscribe-389aeca9.js');

/**
 * @param {MouseEvent} e
 */
const openButtonClick = (e) => {
  e.preventDefault();
  const current = /** @type {HTMLElement} */(e.currentTarget);
  const openId = current.getAttribute('openid');
  let openElement;
  if (openId === 'parent') openElement = current.parentElement;
  else openElement = document.getElementById(openId);
  openElement.classList.toggle('open');
  // if this is an overlay, freeze body
  if (openElement.classList.contains('overlay') 
    || openElement.classList.contains('modal')
    || openElement.hasAttribute('modal-opener')
  ) {
    document.body.style.overflow = 'hidden';
  }
};

document.querySelectorAll('[openid]').forEach((element) => {
  element.addEventListener('click', openButtonClick);
});

/**
 * @param {MouseEvent} e 
 */
const overlayClick = (e) => {
  // close if the overlay itself was clicked
  // or if the close button was clicked
  if (e.target === e.currentTarget || /** @type {HTMLElement} */(e.target).closest('[close]')) {
    /** @type {HTMLElement} */(e.currentTarget).closest('.open').classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.querySelectorAll('.overlay').forEach((element) => {
  element.addEventListener('click', overlayClick);
});
document.querySelectorAll('.modal').forEach((element) => {
  element.addEventListener('click', overlayClick);
});

const loaderClick = async (e) => {
  const name = e.currentTarget.getAttribute('load');
  if (name.startsWith('r-')) {
    loadElement(name);
  } else {
    throw new Error(`No lazy dependency "${name}" found`);
  }
};

document.querySelectorAll('[load]').forEach((element) => {
  element.addEventListener('click', loaderClick);
});
