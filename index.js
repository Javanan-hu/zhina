const Libp2p = require('libp2p');
const WebrtcStar = require('libp2p-webrtc-star');
const Websockets = require('libp2p-websockets');
const Mplex = require('libp2p-mplex');
const Secio = require('libp2p-secio');
const KadDHT = require('libp2p-kad-dht');
const crypto = require('crypto');
const nacl = require('libsodium-wrappers');
import('orbit-db')
  .then((orbitdb) => {
    const OrbitDB = orbitdb.default;
    // rest of your code that uses OrbitDB
  })
  .catch((err) => {
    console.error('Failed to load OrbitDB', err);
  });

// Set up Libp2p node with the desired options
async function createNode() {
  const node = await Libp2p.create({
    addresses: {
      listen: ['/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star'],
    },
    modules: {
      transport: [WebrtcStar, Websockets],
      streamMuxer: [Mplex],
      connEncryption: [Secio],
      dht: KadDHT,
    },
  });
  return node;
}

// Define the Room class
class Room {
  constructor(name, password, orbitdb, type) {
    this.name = name;
    this.password = crypto.createHash('sha256').update(password).digest('base64');
    this.users = [];
    this.chat = orbitdb.kvstore(name);
    this.chat.load();
    this.type = type;
  }

  async join(username, password) {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');
    if (hashedPassword !== this.password) {
      throw new Error('Incorrect password');
    }
    if (this.users.includes(username)) {
      throw new Error('Username already taken');
    }
    this.users.push(username);
    await this.chat.put(username, '');
  }

  async leave(username) {
    const index = this.users.indexOf(username);
    if (index !== -1) {
      this.users.splice(index, 1);
      await this.chat.del(username);
    }
  }

  async broadcast(username, message) {
    const value = `${username}: ${message}`;
    await this.chat.put(username, value);
    for (const user of this.users) {
      if (user !== username) {
        await this.chat.del(user);
        await this.chat.put(user, value);
      }
    }
  }

  async getMessages() {
    const messages = {};
    for (const user of this.users) {
      const value = await this.chat.get(user);
      if (value) {
        messages[user] = value;
      }
    }
    return messages;
  }
}

// Define the User class
class User {
  constructor(username, password, publicKey, privateKey) {
    this.username = username;
    this.password = password;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  async encryptData(data) {
    await nacl.ready;
    const nonce = nacl.randombytes_buf(nacl.crypto_secretbox_NONCEBYTES);
    const message = nacl.crypto_secretbox_easy(data, nonce, this.privateKey);
    const encrypted = new Uint8Array(nonce.length + message.length);
    encrypted.set(nonce);
    encrypted.set(message, nonce.length);
    return encrypted;
  }

  async decryptData(encryptedData) {
    await nacl.ready;
    const nonce = encryptedData.slice(0, nacl.crypto_secretbox_NONCEBYTES);
    const ciphertext = encryptedData.slice(nacl.crypto_secretbox_NONCEBYTES);
    const decrypted = nacl.crypto_secretbox_open_easy(ciphertext, nonce, this.publicKey);
    return decrypted;
  }

  static fromJSON(json) {
    return new User(json.username, json.password, json.publicKey, json.privateKey);
  }

  toJSON() {
    return {
      username: this.username,
      password: this.password,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
    };
  }

  static async generate(username, password) {
    console.log("decryptMessage")
    await nacl.ready;
    const keyPair = nacl.crypto_box_keypair();
    const publicKey = keyPair.publicKey;
    const privateKey = keyPair.privateKey;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');
    const user = new User(username, hashedPassword, publicKey, privateKey);
    return user;
  }

  static async encryptMessage(message, recipientPublicKey, senderPrivateKey) {
    console.log("decryptMessage")
    await nacl.ready;
    const nonce = nacl.randombytes_buf(nacl.crypto_box_NONCEBYTES);
    const ciphertext = nacl.crypto_box_easy(message, nonce, recipientPublicKey, senderPrivateKey);
    const encrypted = new Uint8Array(nonce.length + ciphertext.length);
    encrypted.set(nonce);
    encrypted.set(ciphertext, nonce.length);
    return encrypted;
  }

  static async decryptMessage(encryptedMessage, senderPublicKey, recipientPrivateKey) {
    console.log("decryptMessage")
    await nacl.ready;
    const nonce = encryptedMessage.slice(0, nacl.crypto_box_NONCEBYTES);
    const ciphertext = encryptedMessage.slice(nacl.crypto_box_NONCEBYTES);
    const decrypted = nacl.crypto_box_open_easy(ciphertext, nonce, senderPublicKey, recipientPrivateKey);
    return decrypted;
  }
}

module.exports = User;
