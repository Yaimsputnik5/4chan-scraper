const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');
const os = require('os');
const net = require('net');
const tls = require('tls');
const https = require('https');
const { execSync } = require('child_process');
require('dotenv').config();

const BASE_URL = 'https://boards.4chan.org/b/thread/ThreadIDHere';
const TARGET_FOLDER = path.join(__dirname, 'Output');

fs.ensureDirSync(TARGET_FOLDER);

function connectSocks4(host, port, destHost, destPort, proxyUsername) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const addressBuffer = Buffer.concat([
      Buffer.from([0x04, 0x01]),
      Buffer.from([(destPort >> 8) & 0xff, destPort & 0xff]),
      net.isIPv4(destHost)
        ? Buffer.from(destHost.split('.').map(Number))
        : Buffer.from([0x00, 0x00, 0x00, 0x01]),
      Buffer.from(proxyUsername ? `${proxyUsername}\x00` : '\x00'),
      Buffer.from(destHost),
    ]);
    socket.write(addressBuffer);
    socket.once('data', (response) => {
      if (response[1] !== 0x5a) {
        return reject(new Error('SOCKS4 connection failed'));
      }
      resolve(socket);
    });
    socket.on('error', reject);
  });
}

function connectSocks5(host, port, destHost, destPort, username, password) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const authBuffer = Buffer.concat([
      Buffer.from([0x05, username ? 0x02 : 0x01, 0x00]),
      username ? Buffer.from([username.length, ...Buffer.from(username), password.length, ...Buffer.from(password)]) : Buffer.from([]),
    ]);
    socket.write(authBuffer);
    socket.once('data', (response) => {
      if (response[1] !== 0x00) {
        return reject(new Error('SOCKS5 Authentication Failed'));
      }
      const addressBuffer = Buffer.concat([
        Buffer.from([0x05, 0x01, 0x00, 0x03]),
        Buffer.from([destHost.length]),
        Buffer.from(destHost),
        Buffer.from([(destPort >> 8) & 0xff, destPort & 0xff]),
      ]);
      socket.write(addressBuffer);
    });
    socket.once('data', (response) => {
      if (response[1] !== 0x00) {
        return reject(new Error('SOCKS5 Connection Failed'));
      }
      resolve(socket);
    });
    socket.on('error', reject);
  });
}

function connectHttp(host, port, destHost, destPort, username, password) {
  return new Promise((resolve, reject) => {
    const authHeader = username ? `Proxy-Authorization: Basic ${Buffer.from(`${username}:${password}`).toString('base64')}\r\n` : '';
    const request = `CONNECT ${destHost}:${destPort} HTTP/1.1\r\nHost: ${destHost}:${destPort}\r\n${authHeader}\r\n`;
    const socket = net.createConnection({ host, port });
    socket.write(request);
    socket.once('data', (response) => {
      if (!response.toString().includes('200 Connection established')) {
        return reject(new Error('HTTP proxy connection failed'));
      }
      resolve(socket);
    });
    socket.on('error', reject);
  });
}

function connectSsh(proxyHost, proxyPort, destHost, destPort, username, password) {
  return new Promise((resolve, reject) => {
    const sshCommand = `ssh -L ${proxyPort}:${destHost}:${destPort} ${username}@${proxyHost}`;
    try {
      const sshProcess = execSync(sshCommand, { stdio: 'inherit' });
      resolve(sshProcess);
    } catch (error) {
      reject(error);
    }
  });
}

function connectProxy(destHost, destPort) {
  const proxyType = (process.env.PROXY_TYPE || 'NONE').toUpperCase();
  const proxyHost = process.env.PROXY_HOST || null;
  const proxyPort = parseInt(process.env.PROXY_PORT, 10) || null;
  const proxyUsername = process.env.PROXY_USERNAME || null;
  const proxyPassword = process.env.PROXY_PASSWORD || null;

  switch (proxyType) {
    case 'SOCKS4':
      return connectSocks4(proxyHost, proxyPort, destHost, destPort, proxyUsername);
    case 'SOCKS5':
      return connectSocks5(proxyHost, proxyPort, destHost, destPort, proxyUsername, proxyPassword);
    case 'HTTP':
    case 'HTTPS':
      return connectHttp(proxyHost, proxyPort, destHost, destPort, proxyUsername, proxyPassword);
    case 'SSH':
      return connectSsh(proxyHost, proxyPort, destHost, destPort, proxyUsername, proxyPassword);
    case 'FTP':
      throw new Error('FTP proxy is not supported in this script.');
    case 'NONE':
      return Promise.resolve(null);
    default:
      throw new Error(`Unsupported proxy type: ${proxyType}`);
  }
}

function proxyHttpsRequest(options) {
  return new Promise((resolve, reject) => {
    if (!process.env.PROXY_TYPE || process.env.PROXY_TYPE.toUpperCase() === 'NONE') {
      const req = https.request(options);
      req.on('response', resolve);
      req.on('error', reject);
      req.end();
      return;
    }

    connectProxy(options.hostname, 443)
      .then((socket) => {
        const tlsSocket = tls.connect({ socket, servername: options.hostname });
        const req = https.request({ ...options, socket: tlsSocket, createConnection: () => tlsSocket });
        req.on('response', resolve);
        req.on('error', reject);
        req.end();
      })
      .catch(reject);
  });
}

async function scrapeThread(threadUrl) {
  const urlObj = new URL(threadUrl);
  const response = await proxyHttpsRequest({
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    method: 'GET',
  });

  let html = '';
  response.on('data', (chunk) => (html += chunk));
  await new Promise((resolve) => response.on('end', resolve));

  const regex = /https?:\/\/i\.4cdn\.org\/[^\s'"]+|\/\/i\.4cdn\.org\/[^\s'"]+/g;
  const matches = [...html.matchAll(regex)];
  const fileUrls = matches.map((match) => `https:${match[0]}`);
  const uniqueFileUrls = [...new Set(fileUrls)];

  for (const fileUrl of uniqueFileUrls) {
    const fileName = path.basename(url.parse(fileUrl).pathname);
    const filePath = path.join(TARGET_FOLDER, fileName);

    if (await fs.pathExists(filePath)) {
      continue;
    }

    console.log(`Downloading: ${fileUrl}`);
    try {
      const fileResponse = await proxyHttpsRequest({
        hostname: new URL(fileUrl).hostname,
        path: new URL(fileUrl).pathname,
        method: 'GET',
      });

      const writer = fs.createWriteStream(filePath);
      fileResponse.pipe(writer);

      await new Promise((resolve) => writer.on('finish', resolve));
      console.log(`Downloaded: ${fileUrl}`);
    } catch (error) {
      console.error(`Failed To Download ${fileUrl}:`, error.message);
    }
  }
}

scrapeThread(BASE_URL).catch(console.error);
