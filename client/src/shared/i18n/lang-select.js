// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Localization @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { jsI18n } from './helpers/vendors/jsi18n'

/**
 * Server hit on /i18n/:locale
 * @param {string} lgu
 */

export const langSelect = (lgu) => {
  // document.body.setAttribute('lang', lgu.value);
  jsI18n.processPage()
  fetch(`/i18n/${lgu.value}`)
  setTimeout(() => {
    location.reload()
  }, 3000)
  const loadingText = document.querySelector('.loading-text')
  const bgSection = document.body
  let loading = 0
  const interVal = setInterval(() => {
    loadingText.style.visibility = 'visible'
    loading++
    if (loading > 99) {
      clearInterval(interVal)
    }
    loadingText.innerText = `${loading}%`
    loadingText.style.opacity = scale(0, 0, 100, 1, 0)
    bgSection.style.filter = `blur(${scale(100 - loading, 0, 100, 30, 0)}px)`
  }, 50)
  const scale = (num, inMin, inMax, outMin, outMax) => {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  }
}
