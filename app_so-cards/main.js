const progressbar = document.querySelector('.progress')
const error = document.querySelector('.error')

String.prototype.hashCode = function () {
  let hash = 0; let i; let chr
  if (this.length === 0) return hash
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return '' + hash
}

// A verified version of btoa
function btoaVerified (s) {
  return btoa(s) + '@' + btoa(s).hashCode()
}

function codify (formJSON) {
  let vals = Object.values(formJSON).map((val) => val.trim())
  const key = vals.pop()
  vals = key
    ? vals.map((val) => {
        if (val) { return XORCipher.encode(key, val) }
        return val
      })
    : vals
  const shortestString = vals.join(',')
  let envPath = window.location.href
  // localhost includes index.html but not on web server
  // so remove it from path on localhost environment
  if (envPath.indexOf('file:///') === 0) {
    envPath = envPath.split('/index.html')[0]
  }
  return `${envPath}/card.html#` + btoaVerified(shortestString) + order
}

let formData
const limit = 300
// Manipulate dom on key strokes
function handleFormKeyStrokes () {
  formData = new FormData(document.querySelector('.form1'))
  const formJSON = Object.fromEntries(formData.entries())
  const encodedString = codify(formJSON)
  const percentage = (encodedString.length / limit) * 100
  setTimeout(() => changeProgress(percentage), 1000)
}
// Manipulate dom on form submit
function handleFormSubmit (event) {
  getOrder()
  event.preventDefault()
  formData = new FormData(document.querySelector('.form1'))
  differForConn()
}
// Attach handleFormKeyStrokes
const form = document.querySelector('.contact-form')
form.addEventListener('keyup', handleFormKeyStrokes)
form.addEventListener('submit', handleFormSubmit)
// Language selector.
function langChange (el) {
  // check for right to left formating
  if (el.value === 'ar') { document.dir = 'rtl' } else { document.dir = 'ltr' }
  Stone.setLocale(el.value)
}

window.addEventListener('DOMContentLoaded', e => {
  const langOptions = Array.from(document.querySelector('#lang-select').options)
  const defaultLang = langOptions.filter(option => option.defaultSelected == true)[0]
  langChange(defaultLang)
})

function copyLink () {
  /* Get the text field */
  const copyText = document.getElementById('to_copy')
  /* Select the text field */
  copyText.select()
  copyText.setSelectionRange(0, 99999) /* For mobile devices */
  document.execCommand('copy')
}

function clearPreviousQR () {
  document.getElementById('qrcode').innerHTML = ''
  document.querySelector('#link').innerHTML = ''
}

let order
function getOrder () {
  order = [0, 0, 0, 0, 0]
  const socialArray = ['instagram', 'youtube', 'facebook', 'twitter', 'snapchat']
  const socials = document.getElementsByClassName('sortable-input')
  let i = 1
  for (const social of socials) {
    order[socialArray.indexOf(social.name)] = i
    i += 1
  }
  order = order.join('')
}
let encodedString
function handleDom () {
  // for multi-selects, we need special handling
  const formJSON = Object.fromEntries(formData.entries())
  encodedString = codify(formJSON)
  _id = (Math.random().toString(36).substr(4))
  // mcastUrl = "https://demo.httprelay.io/mcast/" + _id
  // const hotLink = encodedString + '===' + _id
  // console.log(hotLink)

  // const simpleURL = new URLSearchParams(formJSON).toString()
  if (document.querySelector('#link').innerHTML != '') {
    clearPreviousQR()
  }
  const canvas = document.getElementById('qrcode')
  QRCode.toCanvas(canvas, encodedString, function (error) {
    if (error) {
      error.innerHTML = 'Internal text!'
      console.error(error)
      return
    }
    console.log('success!')
  })

  dataURL = canvas.toDataURL()
  const a = document.createElement('a')
  const linkText = document.createTextNode('Share my link')
  a.appendChild(linkText)
  a.title = 'My link'
  a.href = encodedString
  document.querySelector('#link').insertAdjacentHTML('beforeend', '<br><a download=\'my_qr_code.png\' href=\'' + dataURL + '\'>Download QR code</a> | ')
  document.querySelector('#link').insertAdjacentHTML('beforeend', '<a style=\'cursor:pointer\' onClick=\'printAsPDF()\'>Print As PDF</a> | ')
  document.querySelector('#link').appendChild(a)
  document.querySelector('#link').insertAdjacentHTML('beforeend', '<br><div style=\'display:flex\'><input type=\'text\' value=\'' + encodedString + '\' id=\'to_copy\' readonly><i class=\'fa fa-copy icon\' onclick=\'copyLink()\'></i></div>')
  document.getElementById('qrcode').scrollIntoView()
}

const printAsPDF = () => {
  printJS({ printable: dataURL, type: 'image', header: `QR code of ${form.children[0].children[0][0].value}` })
}

const changeProgress = (progress) => {
  progressbar.style.width = `${progress}%`
  if (progress > 100) {
    progressbar.style.width = '100%'
    progressbar.style.backgroundColor = 'black'
    document.getElementById('submit').disabled = true
    error.innerHTML = 'You exceeded the text limit!'
  } else {
    progressbar.style.backgroundColor = '#47ff8d'
    document.getElementById('submit').disabled = false
    error.innerHTML = ''
  }
}

function differForConn () {
  setTimeout(
    function () {
      handleDom()
      opener.document.classified_ads.p_name.value = encodedString
      self.close()
    }, 1000)
}
let _id
let mcastUrl

Stone.enableDomScan(true)

Stone.addCatalogs(stoneJsCatalogs)

// $.ajaxSetup({ xhrFields: { withCredentials: true } });	// For cookies with SeqId

// var receive = function () {
//     $.get(mcastUrl)
//         .done(function (data) {
//             console.log(data);
//         }).always(function () {
//             receive();
//         })
// }
// async function subscribe() {
//     let response = await fetch(mcastUrl);
//     if (response.status == 502) {
//         // Status 502 is a connection timeout error,
//         // may happen when the connection was pending for too long,
//         // and the remote server or a proxy closed it
//         // let's reconnect
//         await new Promise(resolve => setTimeout(resolve, 10000));
//         await subscribe();
//     } else if (response.status != 200) {
//         // An error - let's show it
//         console.log(response.statusText);
//         // Reconnect in one second
//         await new Promise(resolve => setTimeout(resolve, 10000));
//         await subscribe();
//     } else {
//         // Get and show the message
//         let message = await response.text();
//         console.log(message);
//         // Call subscribe() again to get the next message
//         await new Promise(resolve => setTimeout(resolve, 10000));
//         await subscribe();
//     }
// }

// receive();
