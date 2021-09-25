/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/views/easteregg/easteregg.js":
/*!******************************************!*\
  !*** ./src/views/easteregg/easteregg.js ***!
  \******************************************/
/***/ (() => {

eval("const wrapper = document.querySelector('.wrapper svg');\r\nconst btnDraw = document.querySelector('.btn-draw');\r\nconst btnErase = document.querySelector('.btn-erase');\r\n\r\n// We are only adding and removing the 'active' class,\r\n// the entire animation is defined in the CSS code\r\nfunction draw() {\r\n  wrapper.classList.add('active');\r\n}\r\n\r\nfunction erase() {\r\n  wrapper.classList.remove('active');\r\n}\r\n\r\n// Add handlers to our buttons\r\nbtnDraw.addEventListener('click', draw, false);\r\nbtnErase.addEventListener('click', erase, false);\r\n\r\n// Play draw animation once\r\nsetTimeout(draw, 300);\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jbGFzc2lmaWVkLWFkcy00OC1jbGllbnQvLi9zcmMvdmlld3MvZWFzdGVyZWdnL2Vhc3RlcmVnZy5qcz81NzNkIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSIsImZpbGUiOiIuL3NyYy92aWV3cy9lYXN0ZXJlZ2cvZWFzdGVyZWdnLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53cmFwcGVyIHN2ZycpO1xyXG5jb25zdCBidG5EcmF3ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi1kcmF3Jyk7XHJcbmNvbnN0IGJ0bkVyYXNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi1lcmFzZScpO1xyXG5cclxuLy8gV2UgYXJlIG9ubHkgYWRkaW5nIGFuZCByZW1vdmluZyB0aGUgJ2FjdGl2ZScgY2xhc3MsXHJcbi8vIHRoZSBlbnRpcmUgYW5pbWF0aW9uIGlzIGRlZmluZWQgaW4gdGhlIENTUyBjb2RlXHJcbmZ1bmN0aW9uIGRyYXcoKSB7XHJcbiAgd3JhcHBlci5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXJhc2UoKSB7XHJcbiAgd3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxufVxyXG5cclxuLy8gQWRkIGhhbmRsZXJzIHRvIG91ciBidXR0b25zXHJcbmJ0bkRyYXcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkcmF3LCBmYWxzZSk7XHJcbmJ0bkVyYXNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXJhc2UsIGZhbHNlKTtcclxuXHJcbi8vIFBsYXkgZHJhdyBhbmltYXRpb24gb25jZVxyXG5zZXRUaW1lb3V0KGRyYXcsIDMwMCk7XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/views/easteregg/easteregg.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/views/easteregg/easteregg.js"]();
/******/ 	
/******/ })()
;