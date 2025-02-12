// rsa.js

// Helper function to check if a number is prime
export function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }
  
  // Function to generate a random prime number within a range
  export function generateRandomPrime(min, max) {
    let prime = Math.floor(Math.random() * (max - min + 1)) + min;
    while (!isPrime(prime)) {
      prime = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return prime;
  }
  
  // Greatest Common Divisor (Euclidean Algorithm)
  export function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }
  
  // Modular Inverse (Extended Euclidean Algorithm)
  export function modInverse(a, m) {
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) {
        return x;
      }
    }
    return -1;
  }
  
  // Modular Exponentiation (Efficient)
  export function modExp(base, exp, mod) {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * base) % mod;
      }
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return result;
  }
  
  // Key Generation with Random p and q
  export function generateKeys() {
    const p = generateRandomPrime(50, 100);  // Random prime between 50 and 100
    const q = generateRandomPrime(50, 100);  // Random prime between 50 and 100
    
    const n = p * q;
    const phi = (p - 1) * (q - 1);
  
    let e = 17;
    while (gcd(e, phi) !== 1) {
      e++;
    }
  
    const d = modInverse(e, phi);
  
    const publicKey = { n, e };
    const privateKey = { n, d };
    return { publicKey, privateKey };
  }
  
  // Function to store private key in IndexedDB
  export function storePrivateKey(privateKey) {
    if (!window.indexedDB) {
      console.log("IndexedDB is not supported in this browser");
      return;
    }
  
    const request = window.indexedDB.open("rsaKeysDB", 1);
  
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore("keys", { keyPath: "id" });
      objectStore.createIndex("id", "id", { unique: true });
    };
  
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["keys"], "readwrite");
      const objectStore = transaction.objectStore("keys");
      objectStore.put({ id: "privateKey", key: privateKey });
  
      transaction.oncomplete = function () {
        console.log("Private key stored successfully");
      };
  
      transaction.onerror = function () {
        console.log("Error storing private key");
      };
    };
  
    request.onerror = function () {
      console.log("Error opening IndexedDB");
    };
  }
  