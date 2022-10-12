/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const asyncServiceWorker = (async function () {
  if (!("serviceWorker" in window.navigator)) {
    throw new Error("Service Worker Not Supported");
  }
  return await window.navigator.serviceWorker.register("sw.js", {
    scope: "./",
    type: "classic",
    updateViaCache: "none",
  });
})();
  
const arrAlgorithms = [
  {name: "HSS-LMS", value: -46},
  {name: "SHAKE256", value: -45},
  {name: "SHA-512", value: -44},
  {name: "SHA-384", value: -43},
  {name: "RSAES-OAEP w/ SHA-512", value: -42},
  {name: "RSAES-OAEP w/ SHA-256", value: -41},
  {name: "RSAES-OAEP w/ RFC 8017 default parameters", value: -40},
  {name: "PS512", value: -39},
  {name: "PS384", value: -38},
  {name: "PS256", value: -37},
  {name: "ES512", value: -36},
  {name: "ES384", value: -35},
  {name: "ECDH-SS + A256KW", value: -34},
  {name: "ECDH-SS + A192KW", value: -33},
  {name: "ECDH-SS + A128KW", value: -32},
  {name: "ECDH-ES + A256KW", value: -31},
  {name: "ECDH-ES + A192KW", value: -30},
  {name: "ECDH-ES + A128KW", value: -29},
  {name: "ECDH-SS + HKDF-512", value: -28},
  {name: "ECDH-SS + HKDF-256", value: -27},
  {name: "ECDH-ES + HKDF-512", value: -26},
  {name: "ECDH-ES + HKDF-256", value: -25},
  {name: "SHAKE128", value: -18},
  {name: "SHA-512/256", value: -17},
  {name: "SHA-256", value: -16},
  {name: "direct+HKDF-AES-256", value: -13},
  {name: "direct+HKDF-AES-128", value: -12},
  {name: "direct+HKDF-SHA-512", value: -11},
  {name: "direct+HKDF-SHA-256", value: -10},
  {name: "EdDSA", value: -8},
  {name: "ES256", value: -7},
  {name: "direct", value: -6},
  {name: "A256KW", value: -5},
  {name: "A192KW", value: -4},
  {name: "A128KW", value: -3},
  {name: "A128GCM", value: 1},
  {name: "A192GCM", value: 2},
  {name: "A256GCM", value: 3},
  {name: "HMAC 256/64", value: 4},
  {name: "HMAC 256/256", value: 5},
  {name: "HMAC 384/384", value: 6},
  {name: "HMAC 512/512", value: 7},
  {name: "AES-CCM-16-64-128", value: 10},
  {name: "AES-CCM-16-64-256", value: 11},
  {name: "AES-CCM-64-64-128", value: 12},
  {name: "AES-CCM-64-64-256", value: 13},
  {name: "AES-MAC 128/64", value: 14},
  {name: "AES-MAC 256/64", value: 15},
  {name: "ChaCha20/Poly1305", value: 24},
  {name: "AES-MAC 128/128", value: 25},
  {name: "AES-MAC 256/128", value: 26},
  {name: "AES-CCM-16-128-128", value: 30},
  {name: "AES-CCM-16-128-256", value: 31},
  {name: "AES-CCM-64-128-128", value: 32},
  {name: "AES-CCM-64-128-256", value: 33},
  ];

const asyncLoad = new Promise(function (resolve, reject) {
  window.addEventListener("load", function (evt) {
    resolve(evt);
  });
});

let selectAlgorithm;
let inpUsername;

Promise.all( [ asyncLoad, asyncServiceWorker ] ).then(function ( [ evtWindow, myServiceWorkerRegistration ] ) {
  let myServiceWorker;
  myServiceWorker = myServiceWorkerRegistration.active || myServiceWorkerRegistration.installing;
  myServiceWorker.addEventListener("message", function (evt) {
    console.log("sw.js: " + evt.data);
  });
  selectAlgorithm = document.createElement("select");
  document.body.appendChild(selectAlgorithm);
  for (let algorithm of arrAlgorithms) {
    const option = document.createElement("option");
    option.appendChild(document.createTextNode(algorithm.name));
    option.setAttribute("value", algorithm.value);
    selectAlgorithm.appendChild(option);
  }
  const pUsername = document.createElement("p");
  document.body.appendChild(pUsername);
  pUsername.appendChild(document.createTextNode("Username: "));
  inpUsername = document.createElement("input");
  inpUsername.type = "text";
  pUsername.appendChild(inpUsername);
  const pButtons = document.createElement("p");
  document.body.appendChild(pButtons);
  const btnRegister = document.createElement("button");
  btnRegister.innerHTML = "Register";
  btnRegister.addEventListener("click", registerUser);
  pButtons.appendChild(btnRegister);
  const btnLogin = document.createElement("button");
  btnLogin.innerHTML = "Login";
  btnLogin.addEventListener("click", login);
  pButtons.appendChild(btnLogin);
});

async function registerUser() {
  const strAuthURL = "https://scotwatson.github.io/WebAuthentication/auth";
  async function requestRegistration() {
    const objRegistration = {
      username: inpUsername.value,
      alg: selectAlgorithm.value,
    };
    const objRequest = {
      type: "register",
      value: objRegistration,
    };
    const reqRegister = new Request(strAuthURL, {
      method: "POST",
      headers: {},
      body: JSON.stringify(reduceForJSON(objRequest)),
      mode: "cors",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "follow",
      referrer: "about:client",
    });
    return await fetch(reqRegister);
  }
  async function getOptionsFromServer(response) {
    const text = await response.text();
    console.log(text);
    const reducedObj = JSON.parse(text);
    console.log(reducedObj);
    return expandOptionsFromJSON(reducedObj);
  }
  async function makeCertificate(optionsFromServer) {
    const options = {
      publicKey: optionsFromServer,
    };
    console.log(options);
    return await navigator.credentials.create(options);
  }
  async function sendCertificate(credential) {
    const objRequest = {
      type: "certificate",
      value: credential,
    };
    console.log(objRequest);
    const reducedObj = reduceForJSON(objRequest);
    console.log(reducedObj);
    const bodyText = JSON.stringify(reducedObj);
    console.log(bodyText);
    const reqCertificate = new Request(strAuthURL, {
      method: "POST",
      headers: {},
      body: bodyText,
      mode: "cors",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "follow",
      referrer: "about:client",
    });
    return await fetch(reqCertificate);
  }
  const reg = await requestRegistration();
  const options = await getOptionsFromServer(reg);
  const cert = await makeCertificate(options);
  return await sendCertificate(cert);
}

async function login() {
  const strAuthURL = "https://scotwatson.github.io/WebAuthentication/auth";
  async function requestLogin() {
    const objLogin = {
      username: inpUsername.value,
    };
    const objRequest = {
      type: "login",
      value: objLogin,
    };
    const reqLogin = new Request(strAuthURL, {
      method: "POST",
      headers: {},
      body: JSON.stringify(reduceForJSON(objRequest)),
      mode: "cors",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "follow",
      referrer: "about:client",
    });
    return await fetch(reqLogin);
  }
  async function getChallengeFromServer(response) {
    const text = await response.text();
    const reducedObj = JSON.parse(text);
    return expandOptionsFromJSON(reducedObj);
  }
  async function makeAssertion(optionsFromServer) {
    return await navigator.credentials.get({
      publicKey: optionsFromServer,
    });
  }
  async function sendAssertion(assertion) {
    const objRequest = {
      type: "assert",
      value: assertion,
    };
    const reqAssert = new Request(strAuthURL, {
      method: "POST",
      headers: {},
      body: JSON.stringify(reduceForJSON(objRequest)),
      mode: "cors",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "follow",
      referrer: "about:client",
    });
    return await fetch(reqAssert);
  }
  const login = await requestLogin();
  const challenge = await getChallengeFromServer(login);
  const assertion = await makeAssertion(challenge);
  return await sendAssertion(assertion);
}

function reduceForJSON(obj) {
  if (Array.isArray(obj)) {
    return obj;
  }
  switch (typeof obj) {
    case "undefined":
    case "boolean":
    case "number":
    case "bigint":
    case "string":
      return obj;
    case "symbol":
      return "[symbol]";
    case "function":
      return "[function]";
    case "object":
      if (obj === null) {
        return null;
      } else if (obj instanceof ArrayBuffer) {
        return Array.from(new Uint8Array(obj));
      } else {
        let objReduced = {};
        for (let key of Object.keys(obj)) {
          objReduced[key] = reduceForJSON(obj[key]);
        }
        return objReduced;
      }
    default:
      throw new Error("Type not recognized");
  }
}

function expandArrayBufferFromJSON(arr) {
  return Uint8Array.from(arr).buffer;
}

function expandOptionsFromJSON(obj) {
  let objRet = {};
  objRet.challenge = expandArrayBufferFromJSON(obj.challenge);
  objRet.rp = obj.rp;
  objRet.user = {};
  objRet.user.name = obj.user.name;
  objRet.user.displayName = obj.user.displayName;
  objRet.user.id = expandArrayBufferFromJSON(obj.user.id);
  objRet.pubKeyCredParams = obj.pubKeyCredParams;
  objRet.authenticatorSelection = obj.authenticatorSelection;
  objRet.timeout = obj.timeout;
  return objRet;
}
