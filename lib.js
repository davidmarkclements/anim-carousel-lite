var DISABLED = 'carousel-button-disabled';

/**
 * Returns max leftOffset for the carousel
 * @param  {object} carousel
 * @return {number}
 */
function getMaxScroll ( carousel ) {
    return carousel.scrollWidth - carousel.clientWidth;
}

/**
 * Returns an object that describes whether or not the next/previous buttons
 * should be disabled.
 * @param  {integer} newIndex Index position of the new (just scrolled to) item
 * @param  {number}  newPos   Left offset of the new item
 * @param  {object}  carousel
 * @return {object}
 */
function isDisabled ( newIndex, newPos, carousel ) {
    return {
        previous: newIndex === 0,
        next:     newPos >= getMaxScroll( carousel )
    };
}

/**
 * When native scroll is utilized, estimate the scroll index position so
 * that we have a starting spot if the user begins utilizing the next/previous
 * buttons.
 * @param  {object} carousel
 * @param  {array}  items
 * @return {integer}
 */
function getScrollIndex ( carousel, items ) {
    var carouselScroll = carousel.scrollLeft;
    var carouselOffset = carousel.offsetLeft;

    for ( var i = 0; i < items.length; ++i ) {
        if ( ( items[ i ].offsetLeft - carouselOffset ) >= carouselScroll ) {
            return i;
        }
    }

    return -1;
}

/**
 * Returns the left offset of the new item relative to the
 * left offset of the carousel.
 * @param   {object} carousel
 * @param   {object} newItem
 * @return  {number}
 */
function getNewPosition ( carousel, newItem ) {
    return newItem.offsetLeft - carousel.offsetLeft;
}

/**
 * Calculates the new left offset of the carousel, and enables/disables
 * the next/previous buttons accordingly.
 * @param  {object}   carousel
 * @param  {array}    items
 * @param  {integer}  newIndex
 * @param  {object}   next
 * @param  {object}   previous
 * @return {number}
 */
function syncPositionState ( carousel, items, newIndex, next, previous ) {
    var newItem  = items[ newIndex ];
    var newPos   = getNewPosition( carousel, newItem );
    var disabled = isDisabled( newIndex, newPos, carousel );

    toggleDisabled( previous, disabled.previous );
    toggleDisabled( next, disabled.next );

    return newPos;
}

/**
 * Whether or not the carousel has items outside the visible area.
 * @param   {object} carousel
 * @param   {array}  items
 * @return  {boolean}
 */
function carouselCanScroll ( carousel, items ) {
    var lastItem            = items[ items.length - 1 ];
    var lastItemRightOffset = lastItem.offsetLeft - carousel.offsetLeft + lastItem.offsetWidth;
    return lastItemRightOffset <= carousel.clientWidth;
}

/**
 * Upon use of native scroll, estimate the carousel index position and sync
 * the enabled/disabled state for the next/previous buttons.
 * @param {object}   carousel
 * @param {array}    items
 * @param {object}   next
 * @param {object}   previous
 */
function handleScroll ( carousel, items, next, previous ) {
    var newIndex = Math.max(
        getScrollIndex( carousel, items ),
        0
    );

    syncPositionState( carousel, items, newIndex, next, previous );

    carousel.currentIndex = newIndex;
}

/**
 * Toggles the disabled class and attribute
 * @param {object}  el            DOM element
 * @param {boolean} shouldDisable
 */
function toggleDisabled ( el, shouldDisable ) {
    el.classList.toggle( DISABLED, shouldDisable );
    el.disabled = shouldDisable;
}

function getRotator ( carousel, items, next, previous ) {
    return function ( reverse ) {
        var currentIndex = carousel.currentIndex || 0;
        var incrementor  = reverse ? -1 : 1;
        var direction    = reverse ? previous : next;
        var newIndex     = currentIndex + incrementor;

        if ( direction.classList.contains( DISABLED ) ) {
            return;
        }

        scrollTo( carousel, syncPositionState( carousel, items, newIndex, next, previous ))

        // carousel.scrollLeft   = syncPositionState( carousel, items, newIndex, next, previous );
        carousel.currentIndex = newIndex;
    };
}



function easeInOutQuad(t, b, c, d) {
  t /= d/2;
  if (t < 1) {
    return c/2*t*t + b
  }
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
};

function inOutQuintic(t, b, c, d) {
  var ts = (t/=d)*t,
  tc = ts*t;
  return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
};

var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };

function scrollTo(el, to, duration, callback) {
  duration = typeof duration === 'number' ? duration : 200;

  var start = position(),
    change = to - start,
    currentTime = 0,
    increment = 20;

  anim();

  function anim() {
    currentTime += increment;
    move(easeInOutQuad(currentTime, start, change, duration));
    if (currentTime < duration) return requestAnimFrame(anim); 
    if (callback instanceof Function) callback();    
  }

  function move(amount) { el.scrollLeft = amount; }
  function position() { return el.scrollLeft; }

}


module.exports.toggleDisabled    = toggleDisabled;
module.exports.getRotator        = getRotator;
module.exports.getScrollIndex    = getScrollIndex;
module.exports.carouselCanScroll = carouselCanScroll;
module.exports.handleScroll      = handleScroll;
