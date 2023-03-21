# Libp2p-Chat
This is a simple chat application built using libp2p and orbit-db libraries. Users can create chat rooms and join existing ones, and send encrypted messages to each other.

# Dependencies
libp2p - A modular peer-to-peer networking stack
libp2p-webrtc-star - A libp2p transport module that uses WebRTC
libp2p-websockets - A libp2p transport module that uses websockets
libp2p-mplex - A libp2p stream multiplexer module
libp2p-secio - A libp2p connection encryption module
libp2p-kad-dht - A libp2p distributed hash table implementation
crypto - A Node.js library for cryptographic operations
libsodium-wrappers - A wrapper library for the libsodium cryptographic library
orbit-db - A distributed database for peer-to-peer applications
Code Overview
The code consists of two classes, User and Room. User represents a user in the chat application, while Room represents a chat room.

# The User class has the following methods:

constructor(username, password, publicKey, privateKey) - Creates a new user with the given username, password, publicKey, and privateKey.
encryptData(data) - Encrypts the given data using the user's privateKey.
decryptData(encryptedData) - Decrypts the given encryptedData using the user's publicKey.
toJSON() - Returns a JSON representation of the user object.
static fromJSON(json) - Creates a new User object from the given JSON representation.
static async generate(username, password) - Generates a new User object with a new keypair and the given username and password.
static async encryptMessage(message, recipientPublicKey, senderPrivateKey) - Encrypts the given message using the recipientPublicKey and senderPrivateKey.
static async decryptMessage(encryptedMessage, senderPublicKey, recipientPrivateKey) - Decrypts the given encryptedMessage using the senderPublicKey and recipientPrivateKey.
The Room class has the following methods:

constructor(name, password, orbitdb, type) - Creates a new Room object with the given name, password, orbitdb, and type.
join(username, password) - Allows a user to join the room with the given username and password.
leave(username) - Allows a user to leave the room with the given username.
broadcast(username, message) - Sends the given message from the user with the given username to all users in the room.
getMessages() - Retrieves all messages in the room.
The code also exports the User class.

# Usage
To use the code, import the User class and create a new user with User.generate(username, password). You can then use the encryptData, decryptData, encryptMessage, and decryptMessage methods to encrypt and decrypt data and messages.

To create a new room, use the Room class constructor. You can then use the join, leave, broadcast, and getMessages methods to manage the room and send messages.
