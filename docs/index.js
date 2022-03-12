/*
(c) 2022 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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

window.addEventListener("load", function () {
  const selectAlgorithm = document.createElement("select");
  document.body.appendChild(selectAlgorithm);
  for (let algorithm of arrAlgorithms) {
    const option = document.createElement("option");
    option.appendChild(document.createTextNode(algorithm.name));
    option.setAttribute("value", algorithm.value);
    selectAlgorithm.appendChild(option);
  }
  const pValue = document.createElement("p");
  document.body.appendChild(pValue);
  setInterval(function () {
    pValue.innerHTML = selectAlgorithm.value;
  }, 1000);
});

