export function encryptKey(passkey: string) {
    return btoa(passkey);
  }
  export function decryptKey(passkey: string) {
    return atob(passkey);
  }
  