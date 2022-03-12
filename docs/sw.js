/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function project_file(filename) {
  // NOTE: This path is hardcoded, as the service worker cannot access window.location
  const pathname = "/WebAuthentication/";
  return pathname + filename;
}

const optionsFromServer = {
  "challenge": "random_string", // need to convert to ArrayBuffer
  "rp": {  					  // my website info
    "name": "My Website",
    "id": "mywebsite.com"
  },
  "user": {                     // user info
    "name": "anthony@email.com",  				
    "displayName": "Anthony",
    "id": "USER_ID_12345678910" // need to convert to ArrayBuffer
  },
  "pubKeyCredParams": [
    {
      "type": "public-key",
      "alg": -7				  // Accepted Algorithm
    }
  ],
  "authenticatorSelection": {
  	authenticatorAttachment: "platform",
  },
  "timeout": 60000              // in milliseconds
};

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
  console.log(e);
  function sendResponse(response) {
    return response || fetch(e.request);
  }
  e.respondWith(caches.match(e.request).then(sendResponse));
  console.log("sw.js: End Handling Fetch");
}

self.addEventListener("install", self_install);
self.addEventListener("fetch", self_fetch);
