const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');
const os = require('os');

const BASE_URL = 'https://boards.4chan.org/b/thread/ThreadIDHere';
const TARGET_FOLDER = path.join(__dirname, 'Output');

fs.ensureDirSync(TARGET_FOLDER);

async function downloadFile(fileUrl, filePath) {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    url: fileUrl,
    method: 'GET',
    responseType: 'stream',
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function makeFileHidden(filePath) {
  if (os.platform() === 'win32') {
    return new Promise((resolve, reject) => {
      exec(`attrib +h "${filePath}"`, (error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  } else {
    const hiddenFilePath = path.join(path.dirname(filePath), `.${path.basename(filePath)}`);
    await fs.rename(filePath, hiddenFilePath);
  }
}

async function scrapeThread(threadUrl) {
  const response = await axios.get(threadUrl);
  const html = response.data;

  const regex = /https?:\/\/i\.4cdn\.org\/[^\s'"]+|\/\/i\.4cdn\.org\/[^\s'"]+/g;
  const matches = [...html.matchAll(regex)];

  const fileUrls = matches.map(match => `https:${match[0]}`);

  const uniqueFileUrls = [...new Set(fileUrls)];

  for (const fileUrl of uniqueFileUrls) {
    if (fileUrl.includes('s.jpg') || fileUrl.includes('s.jpeg') || fileUrl.includes('s.png') || fileUrl.includes('s.gif') || fileUrl.includes('s.bitmap') || fileUrl.includes('s.bmp') || fileUrl.includes('s.webp') || fileUrl.includes('s.webm') || fileUrl.includes('s.mp4') || fileUrl.includes('s.mov') || fileUrl.includes('s.mkv')) {
      continue;
    }

    const fileName = path.basename(url.parse(fileUrl).pathname);
    const filePath = path.join(TARGET_FOLDER, fileName);

    let date_ob = new Date();
    let day = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    let timestamp = month + "/" + day + "/" + year + " | " + date_ob.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    if (await fs.pathExists(filePath)) {
      // console.log(`[${timestamp}] | File: ${filePath} Already Exists | Skipping Download.\n`);
      // Disabled By Default To Prevent Flooding Console
      continue;
    }

    console.log(`[${timestamp}] | Downloading: ${fileUrl} | To: ${filePath}\n`);
    try {
      await downloadFile(fileUrl, filePath);
      console.log(`[${timestamp}] | Successfully Downloaded: ${fileUrl}\n`);
      
      await makeFileHidden(filePath);
      console.log(`[${timestamp}] | File: ${filePath} Marked As Hidden\n`);
    } catch (error) {
      console.error(`[${timestamp}] | Failed To Download: ${fileUrl}:`, error.message);
    }
  }
}

scrapeThread(BASE_URL).catch(console.error);
