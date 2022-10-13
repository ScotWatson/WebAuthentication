/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

self.importScripts("https://scotwatson.github.io/WebInterface/window_extensions.js");

const thisURL = new URL("https://scotwatson.github.io/WebAuthentication/");
const origin = thisURL.origin;
const pathname = thisURL.pathname;
const userIDs = new Map();
const savedCertificates = new Map();

let myClient = null;

// Returns an ArrayBuffer of given length
// NOT CRYPTOGRAPHICALLY SECURE
function randomBuffer(length) {
  const retView = new Uint8Array(length);
  for (let i = 0; i < length; ++i) {
    retView[i] = Math.floor(Math.random() * 256);
  }
  return retView.buffer;
}

async function simulateAuth(requestBody) {
  function parse(text) {
    const objRequest = JSON.parse(text);
    switch (objRequest.type) {
      case "register":
        return createOptions(objRequest.value);
      case "certificate":
        return saveCertificate(objRequest.value);
      case "login":
        return sendChallenge(objRequest.value);
      case "assert":
        return testAssertion(objRequest.value);
      default:
        return unknownRequest();
    }
  }
  return parse(requestBody);
}

function unknownRequest() {
  return {
    status: 400,
    body, "",
  };
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
      "id": thisURL.hostname,
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
      userVerification: "discouraged",
    },
    "timeout": 60000,
  };
  return {
    status: 200,
    body: JSON.stringify(reduceForJSON(optionsFromServer)),
  };
}

function saveCertificate(objRequestValue) {
  console.log(objRequestValue);
  const objCertificate = expandCertificateFromJSON(objRequestValue);
  console.log(objCertificate);
  savedCertificates.set(objCertificate.id, objCertificate);
  return {
    status: 200,
    body: "",
  };
}

function sendChallenge(objRequestValue) {
  const username = objRequestValue.username;
  const userID = userIDs.get(username);
  const userCertificate = savedCertificates.get(userID);
  const challengeFromServer = {
    "challenge": randomBuffer(16),
    "timeout": 60000,
    "rpId": pathname + "/auth",
    "allowCredentials": [
      {
        "type": "public-key",
        "id": userID,
      }
    ],
    "userVerification": "discouraged",
  };
  return {
    status: 200,
    body: JSON.stringify(reduceForJSON(challengeFromServer)),
  };
}

async function testAssertion(objRequestValue) {
  // getAssertionFromClient
  const options = expandAssertionFromJSON(JSON.parse(objRequestValue));
  // getCredential
  const objCredential = await navigator.credentials.get({
    publicKey: options,
  });
  // parseCredential
  const response = objCredential.response;
  const clientExtensionResults = objCredential.getClientExtensionResults();
  const cData = response.clientDataJSON;
  const authData = response.authenticatorData;
  const viewAuthData = new Uint8Array(authData);
  const sig = response.signature;
  const encoder = new TextEncoder();
  const JSONtext = encoder.encode(cData);
  const C = JSON.parse(JSONtext);
  if (C.type !== "webauthn.get") {
    throw new Error("Invalid Type");
  }
  const myBase64Decoder = new wifBase64Decoder();
  if (C.challenge !== myBase64Decoder.decode(options.challenge)) {
    throw new Error("Invalid Challenge");
  }
  if (C.origin !== origin) {
    throw new Error("Invalid Origin");
  }
  const promiseRpIdHash = self.crypto.subtle.digest("sha-256", pathname).then(function (hash) {
    const viewHash = new Uint8Array(hash);
    for (let i = 0; i < 32; ++i) {
      if (viewHash[i] !== viewAuthData[i]) {
        return false;
      }
    }
    return true;
  });
  const boolUP = viewAuthData[32] & 0x01;
  const boolUV = viewAuthData[32] & 0x04;
  const boolAT = viewAuthData[32] & 0x40;
  const boolED = viewAuthData[32] & 0x80;
  const promiseCDataHash = self.crypto.subtle.digest("sha-256", cData);
  credentialPublicKey

  return {
    status: 200,
    body: "",
  };
}

function sendMessage(text) {
  self.clients.matchAll({
    includeUncontrolled: true,
    type: "all",
  }).then(function (clientList) {
    for (const client of clientList) {
      client.postMessage(text);
    }
  });
}

function self_install(e) {
  console.log("(sw.js): Start Installing");
  function addCaches(cache) {
    console.log("(sw.js): Start Adding Caches");
    console.log("(sw.js): End Adding Caches");
  }
  e.waitUntil(caches.open("store").then(addCaches));
  console.log("(sw.js): End Installing");
}

function self_fetch(e) {
  console.log("(sw.js): Start Handling Fetch");
  sendMessage("Start Handling Fetch");
  async function getResponse() {
    console.log("(sw.js): " + "Request URL: " + e.request.url);
    sendMessage("Request URL: " + e.request.url);
    let response;
    switch (e.request.url) {
      case "https://scotwatson.github.io/WebAuthentication/auth":
        const requestBody = e.request.text();
        console.log("(sw.js): " + "Request Body: " + requestBody);
        sendMessage("Request Body: " + requestBody);
        const responseInfo = await simulateAuth(requestBody);
        console.log("(sw.js): " + "Response Body: " + responseInfo.body);
        sendMessage("Response Body: " + responseInfo.body);
        response = new Response(responseInfo.body, {
          status: responseInfo.status,
          statusText: getStatusText(responseInfo.status),
          headers: {},
        });
      default:
        response = await fetch(e.request);
    }
    console.log("(sw.js): " + "Response Status: " + response.status);
    sendMessage("Response Status: " + response.status);
    console.log("(sw.js): End Handling Fetch");
    sendMessage("End Handling Fetch");
    return response;
  }
  e.respondWith(getResponse());
}

function getStatusText(status) {
  switch (status) {
    case 200:
      return "OK";
    case 400:
      return "Bad Request";
    case 500:
      return "Internal Server Error";
    default:
      return "";
  }
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
        for (const key in obj) {
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

function expandCertificateFromJSON(obj) {
  let objRet = {};
  objRet.id = obj.id;
  objRet.rawId = expandArrayBufferFromJSON(obj.rawId);
  objRet.response = {};
  objRet.response.clientDataJSON = expandArrayBufferFromJSON(obj.response.clientDataJSON);
  objRet.response.attestationObject = expandArrayBufferFromJSON(obj.response.attestationObject);
  objRet.type = obj.type;
  return objRet;
}

function expandAssertionFromJSON(obj) {
  let objRet = Object.create(PublicKeyCredential.prototype);
  objRet.id = obj.id;
  objRet.rawId = expandArrayBufferFromJSON(obj.rawId);
  objRet.response = {};
  objRet.response.authenticatorData = expandArrayBufferFromJSON(obj.response.authenticatorData);
  objRet.response.clientDataJSON = expandArrayBufferFromJSON(obj.response.clientDataJSON);
  objRet.response.signature = expandArrayBufferFromJSON(obj.response.signature);
  objRet.response.userHandle = expandArrayBufferFromJSON(obj.response.userHandle);
  objRet.type = obj.type;
  if (obj.allowCredentials) {
    objRet.allowCredentials = obj.allowCredentials;
  }
  return objRet;
}

self.addEventListener("install", self_install);
self.addEventListener("fetch", self_fetch);
