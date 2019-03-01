/**
 * I managed to translate this script from jQuery to vanilla js thanks to some resources.
 * I tried my best to link to all the sources I used.
 *
 * https://html-online.com/articles/dynamic-scroll-back-top-page-button-javascript/
 **/

// https://stackoverflow.com/questions/30206054/vanilla-javascript-fadein-fadeout-without-jquery
function fade(element, type, ms) {
    let isIn = type === 'in',
        opacity = isIn ? 0 : 1,
        interval = 50,
        duration = ms,
        gap = interval / duration;

    if (isIn) {
        element.style.display = 'inline';
        element.style.opacity = opacity;
    }

    let fading = window.setInterval(() => {
        opacity = isIn ? opacity + gap : opacity - gap;
        element.style.opacity = opacity;

        if (opacity <= 0) element.style.display = 'none';
        if (opacity <= 0 || opacity >= 1) window.clearInterval(fading);
    }, interval);
}

// https://stackoverflow.com/questions/8917921/cross-browser-javascript-not-jquery-scroll-to-top-animation
function scrollSmoothly(element, to, duration) {
    if (duration <= 0) return;
    let difference = to - element.scrollTop;
    let perTick = difference / duration * 10;

    setTimeout(function () {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollSmoothly(element, to, duration - 10);
    }, 10);
}

let visible = false;
window.addEventListener('scroll', function () {
    let height = window.pageYOffset;
    if (visible) {
        visible = height > 100;
        if (!visible) {
            fade(document.getElementById('back2Top'), 'out', 200);
        }
    } else {
        visible = height > 100;
        if (visible) {
            fade(document.getElementById('back2Top'), 'in', 200);
        }
    }
});
window.addEventListener('load', function () {
    document.getElementById('back2Top').addEventListener('click', function () {
        event.preventDefault();
        scrollSmoothly(document.documentElement, 0, 350);
        return false;
    });
});