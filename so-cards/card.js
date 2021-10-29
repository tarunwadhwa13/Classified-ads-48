String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return "" + hash;
};

// A verified version of atob
function atobVerified(s) {
    [data, hash] = s.split("@")
    if (data.hashCode() === hash)
        return atob(data)
    else
        return ""
}

var order = "00000"
function reverse(url) {
    order = url.substring(url.length - 5);
    url = url.substring(0, url.length - 5);
    var url_ = atobVerified(url.substring(1))
    return url_.split(",")
}

var bugous = false
var url = window.location.href;
// get part after card.html in link
var vals = reverse(url.split('card.html')[1]);
if (typeof(vals) === 'undefined' || vals.length === 1) {
    bugous = true
}

function createDataArray() {
    var keys = ["user", "instagram", "youtube", "facebook", "twitter", "snapchat", "envelope", "phone"]
    const dataArray = []
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] == 'user') {
        dataArray.push([0, keys[i], vals[i]])
    } else if (keys[i] == 'envelope') {
        dataArray.push([keys.length - 2, keys[i], vals[i]])
    } else if (keys[i] == 'phone') {
        dataArray.push([keys.length - 1, keys[i], vals[i]])
    } else {
        var socialOrder = parseInt(order[i - 1]);
        dataArray.push([socialOrder, keys[i], vals[socialOrder]]); 
    }
  }
  return dataArray
}

const form = document.querySelector('.form1');
var dataArray = createDataArray();
dataArray.sort();

let _isMobile = false
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
    _isMobile = true
}
// Language selector.
function langChange(el) {// check for right to left formating
    if (el.value === 'ar') {document.dir="rtl"}else {document.dir="ltr"}
    Stone.setLocale(el.value);
}

window.addEventListener('DOMContentLoaded', e => {
    let langOptions = Array.from(document.querySelector("#lang-select").options);
    let defaultLang = langOptions.filter(option => option.defaultSelected == true)[0];
    langChange(defaultLang);
});

// Decrypt button event listener
const btn = document.getElementById("decrypt-button")
btn.addEventListener("click", function() {
    var password = prompt("This social card seems encrypted. Enter in the key!") || "";
    if (password.length < 4 || password.length > 8) {
        bugous = true;
    } else {
        for (socialArray of dataArray) {
            if (socialArray[2]) {
                socialArray[2] = XORCipher.decode(password, socialArray[2]);
            }
        }
        document.getElementsByClassName('form1')[0].innerHTML = '';
        inputSubmittedData(dataArray);
    }
});

var submittedSocials = 0
function inputSubmittedData(dataArray) {
    for (socialArray of dataArray) {
        var key = socialArray[1];
        var value = socialArray[2];
        if (value != '') {
            submittedSocials += 1;
            if (key === "envelope") {
                form.insertAdjacentHTML('beforeend', `<div id="mail-id"><a href="mailto:${value}">${value}</a></div>`)
                continue
            } else if (key === "phone") {
                form.insertAdjacentHTML('beforeend', `<div id="phone-id"><a href="tel:${value}">${value}</a></div>`)
                continue
            } else if (key === "user") {
                document.querySelectorAll('.user').forEach(node => { node.innerHTML = value })
            }
            var x = document.createElement("I");
            x.setAttribute("class", `fa fa-${key} icon`);
            form.appendChild(x)

            var y = document.createElement("INPUT");
            y.setAttribute("name", key);
            y.setAttribute("class", "input-field");
            y.setAttribute("value", value);
            y.setAttribute("type", "text");
            y.setAttribute("readonly", "readonly");
            form.appendChild(y)
        }
    }
}

inputSubmittedData(dataArray);

// Values over 7 result in svg images too large for the card
if (submittedSocials > 7) {
  submittedSocials = 7;
}

// Generate some art
if (!_isMobile && !bugous) {
    form.insertAdjacentHTML('afterend', generateSvg())
}

if (bugous) {
    // rollback
    form.innerHTML = ""
    var img = document.createElement('img');
    img.src = 'assets/giphy.gif';
    form.appendChild(img);
    var p = document.createElement('p');
    p.innerText = "QR code or URL is probably wrong"
    form.appendChild(p);
}

// Just a simple generative art 
function getRandomItem(list) {
    var random_index = Math.floor(Math.random() * list.length);
    return list[random_index];
}

function generateSvg() {
    var svg = '';
    var width = 50;
    var height = 50;
    var width_choices = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44];
    var fill_choices = ['gray', 'gray', 'maroon', 'maroon', 'maroon', 'maroon', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'];
    var stroke_choices = [1, 3, 5];

    for (var index_x = 0; index_x < 7; index_x++) {
        for (var index_y = 0; index_y < submittedSocials; index_y++) {
            var rectangle_width = getRandomItem(width_choices);
            var rectangle_height = getRandomItem(width_choices);
            var random_fill_color = getRandomItem(fill_choices);
            var random_stroke_width = getRandomItem(stroke_choices);
            svg = svg + '<rect x="' + index_x * width + '" y="' + index_y * height +
                '" width="' + rectangle_width + '" height="' + rectangle_height +
                '" stroke="black" fill="' + random_fill_color + '" stroke-width="' + random_stroke_width + '"/>';
        }
    }
    return `<div id="art"> <svg width="400" height=${submittedSocials * 50}>` + svg + '</svg> </div>';
}
document.body.hidden = false;

Stone.enableDomScan(true);

Stone.addCatalogs(stoneJsCatalogs);

// var _id;
// var mcastUrl;
// $.ajaxSetup({ xhrFields: { withCredentials: true } });	// For cookies with SeqId
// $.post(mcastUrl, "holla");
