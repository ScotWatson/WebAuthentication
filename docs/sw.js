/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const origin = "https://scotwatson.github.io/";
const pathname = origin + "WebAuthentication/";
const userIDs = new Map();
const savedCertificates = new Map();

// Returns an ArrayBuffer of given length
// NOT CRYPTOGRAPHICALLY SECURE
function randomBuffer(length) {
  const retView = new Uint8Array(length);
  for (let i = 0; i < length; ++i) {
    retView[i] = Math.floor(Math.random() * 256);
  }
  return retView.buffer;
}

function simulateAuth(request) {
  function parse(objRequest) {
    switch (objRequest.type) {
      case "register":
        return createOptions(objRequest.value);
      case "certificate":
        return saveCertificate(objRequest.value);
      case "login":
        return login(objRequest.value);
      case "assert":
        return assert(objRequest.value);
      default:
        return unknownRequest();
    }
  }
  return request.text().then(parse);
}

function ResponseOK(objBody) {
  return new Response(objBody, {
    status: 200,
    statusText: "OK",
    headers: {},
  });
}

function ResponseClientError(objBody) {
  return new Response(objBody, {
    status: 400,
    statusText: "Bad Request",
    headers: {},
  });
}

function ResponseServerError(objBody) {
  return new Response(objBody, {
    status: 500,
    statusText: "Internal Server Error",
    headers: {},
  });
}

function unknownRequest() {
  return ResponseClientError("");
}

function createOptions(objRequestValue) {
  const objRegistration = objRequestValue;
  const alg = objRegistration.alg;
  const username = objRegistration.username;
  const userID = randomBuffer(16);
  userIDs.set(username, userID);
  const optionsFromServer = {
    "challenge": randomBuffer(16),
    "rp": {
      "name": "Web Authentication Test",
      "id": pathname,
    },
    "user": {
      "name": objRegistration.username,
      "displayName": objRegistration.username,
      "id": userID,
    },
    "pubKeyCredParams": [
      {
        "type": "public-key",
        "alg": alg,
      }
    ],
    "authenticatorSelection": {
      authenticatorAttachment: "platform",
    },
    "timeout": 60000,
  };
  return ResponseOK(serialize(optionsFromServer));
}

function saveCertificate(objRequestValue) {
  const objCertificate = deserializeCertificate(deserialize(objRequestValue));
  savedCertificates.set(objCertificate.id, objCertificate);
  return new ResponseOK("");
}

function sendChallenge(objRequestValue) {
  const username = objRequestValue.username;
  const userID = userIDs.get(username);
  const userCertificate = savedCertificates.get(userID);
  const optionsFromServer = {
    "challenge": randomBuffer(16),
    "timeout": 60000,
    "rpId": pathname + "/auth",
    "allowCredentials": [
      {
        "type": "public-key",
        "id": userID,
      }
    ]
  };
  return new ResponseOK("");
}

function saveCertificate(objRequestValue) {
}

  
function self_install(e) {
  console.log("sw.js: Start Installing");
  function addCaches(cache) {
    console.log("sw.js: Start Adding Caches");
    console.log("sw.js: End Adding Caches");
  }
  e.waitUntil(caches.open("store").then(addCaches));
  console.log("sw.js: End Installing");
}

function self_fetch(e) {
  console.log("sw.js: Start Handling Fetch");
  function getResponse() {
    switch (e.request.url) {
      case "/auth":
        return ;
      default:
        return fetch(e.request);
    }
  }
  e.respondWith(getResponse);
  console.log("sw.js: End Handling Fetch");
}

function serialize(obj) {
  let objFlat = {};
  for (let key of Object.keys(obj)) {
    switch (typeof obj[key]) {
      case "undefined":
      case "boolean":
      case "number":
      case "bigint":
      case "string":
        objFlat[key] = obj[key];
        break;
      case "symbol":
        objFlat[key] = "[symbol]";
        break;
      case "function":
        objFlat[key] = "[function]";
        break;
      case "object":
        if (obj[key] === null) {
          objFlat[key] = null;
        } else if (obj[key] instanceof ArrayBuffer) {
          objFlat[key] = Array.from(obj[key]);
        } else {
          objFlat[key] = serialize(obj[key]);
        }
      default:
        break;
    }
  }
  return JSON.stringify(objFlat[key]);
}

function deserialize(text) {
  return JSON.parse(obj);
}

function deserializeArrayBuffer(arr) {
  return ArrayBuffer.from(arr);
}

function deserializeCertificate(obj) {
  let objRet = {};
  objRet.id = obj.id;
  objRet.rawId = deserializeArrayBuffer(obj.rawId);
  objRet.response = Object.create(AuthenticatorAttestationResponse.prototype);
  objRet.response.clientDataJSON = deserializeArrayBuffer(obj.response.clientDataJSON);
  objRet.response.attestationObject = deserializeArrayBuffer(obj.response.attestationObject);
  objRet.type = objRet.type;
  return objRet;
}

self.addEventListener("install", self_install);
self.addEventListener("fetch", self_fetch);
