/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function project_file(filename) {
  // NOTE: This path is hardcoded, as the service worker cannot access window.location
  const pathname = "/WebAuthentication/";
  return pathname + filename;
}

// Returns an ArrayBuffer of given length
// NOT CRYPTOGRAPHICALLY SECURE
function randomBuffer(length) {
  const retView = new Uint8Array(length);
  for (let i = 0; i < length; ++i) {
    retView[i] = Math.floor(Math.random() * 256);
  }
  return retView.buffer;
}

function respondOptions(request) {
  request.text().then(createOptions);
  function createOptions(requestBody) {
    const objRegistration = JSON.parse(requestBody);
    const optionsFromServer = {
      "challenge": randomBuffer(16),
      "rp": {
        "name": "Web Authentication Test",
        "id": "scotwatson.github.io/WebAuthentication"
      },
      "user": {
        "name": objRegistration.username,
        "displayName": objRegistration.username,
        "id": randomBuffer(16),
      },
      "pubKeyCredParams": [
        {
          "type": "public-key",
          "alg": -7
        }
      ],
      "authenticatorSelection": {
        authenticatorAttachment: "platform",
      },
      "timeout": 60000,
    };
    return new Response(serialize(optionsFromServer), {
      status: 200,
      statusText: "OK",
      headers: {},
    });
  }
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
    JSON.stringify(objFlat[key]);
  }
}

self.addEventListener("install", self_install);
self.addEventListener("fetch", self_fetch);
