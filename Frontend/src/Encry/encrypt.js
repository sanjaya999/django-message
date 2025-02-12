/**
 * Simple XOR-based encryption and decryption functions.
 * This approach uses the XOR operator to combine each character of the plaintext
 * with a corresponding character from the key (cycling through the key as needed).
 *
 * The encrypted result is output as a hexadecimal string.
 * 
 * IMPORTANT: This method is not secure for real-world applications.
 */

// Encrypt a plaintext message using a given key
 export function simpleEncrypt(plaintext, key) {
    let ciphertext = "";
    
    for (let i = 0; i < plaintext.length; i++) {
      // XOR the character codes of the plaintext and the key character
      const charCode = plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      // Convert the result to a 2-digit hexadecimal string
      ciphertext += ("0" + charCode.toString(16)).slice(-2);
    }
    
    return ciphertext;
  }
  
  // Decrypt a hexadecimal ciphertext using a given key
 export function simpleDecrypt(ciphertext, key) {
    let plaintext = "";
    
    // Process two hex characters at a time
    for (let i = 0; i < ciphertext.length; i += 2) {
      // Convert the hex pair back to an integer
      const hexPair = ciphertext.substr(i, 2);
      const charCode = parseInt(hexPair, 16);
      // XOR with the corresponding key character (cycling through the key)
      const originalCharCode = charCode ^ key.charCodeAt((i / 2) % key.length);
      plaintext += String.fromCharCode(originalCharCode);
    }
    
    return plaintext;
  }
  
