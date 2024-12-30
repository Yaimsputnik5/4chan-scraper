## <center>**4chan Scraper**</center>

---

### <center>A robust Node.js script designed for **scraping** images and videos from any 4chan thread. Perfect for archiving threads or collecting media content from the internet's most notorious image board.</center>
---
![4chan Scraper](https://upload.wikimedia.org/wikipedia/commons/0/0f/4chan_Logo.png)

---
## Table of Contents

- [Description](#description)
- [Features](#features)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [License](#license)
- [Credits](#credits)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

---
##  <center>Description</center>

### <center>**4chan Scraper is a powerful tool to automate the downloading of media files from 4chan threads. With this script, you can effortlessly scrape and save images and videos while managing existing files and handling platform-specific quirks.**</center>

---

##  <center>Features</center>

#### <center> - 🌐 **Comprehensive Scraping**: Extracts all media links from the specified 4chan thread.</center>
#### <center> - 📁 **Efficient Downloading**: Downloads files to a designated folder, skipping existing ones to save time.</center>
#### <center> - 🗂️ **File Management**: Automatically marks files as hidden on Windows or renames them on other platforms.</center>
#### <center> - 🔄 **Error Handling**: Robust error handling ensures the script continues even if some downloads fail.</center>

---

## <center>How It Works</center>

### <center>**How 4chan Scraper works**</center>

The `4chan Scraper` script is designed to extract and download media files (images and videos) from a specified 4chan thread. Here's a step-by-step breakdown of how it works:

1. **Setup and Initialization**
   - The script starts by importing the necessary modules: `axios` for HTTP requests, `fs-extra` for file operations, `path` for handling file paths, `url` for URL parsing, `child_process` for executing system commands, and `os` to detect the operating system.
   - It defines constants for the base URL of the 4chan thread and the target folder where downloaded files will be saved. The target folder is created if it does not already exist using `fs.ensureDirSync()`.

2. **Download File Function**
   - The `downloadFile` function is responsible for downloading a file from a given URL and saving it to the specified file path.
   - It uses `axios` to perform a GET request with the `responseType` set to 'stream', allowing the file to be downloaded in chunks.
   - The response data is piped into a writable stream created with `fs.createWriteStream()`. A promise is returned to handle completion or errors of the download operation.

3. **Make File Hidden Function**
   - The `makeFileHidden` function ensures that the downloaded files are hidden based on the operating system.
   - For Windows (`win32` platform), it uses the `attrib` command to mark the file as hidden.
   - For other platforms (Unix-based), it renames the file to prepend a dot (`.`) to the filename, which is a convention for hidden files in Unix-like systems.

4. **Scrape Thread Function**
   - The `scrapeThread` function takes the URL of a 4chan thread as an argument and performs the following steps:
     - **Fetching the Thread Content**: It uses `axios` to fetch the HTML content of the specified thread URL.
     - **Extracting Media URLs**: The HTML content is processed to extract media file URLs using a regular expression that matches common 4chan media paths. These URLs are then prefixed with 'https:' to form the complete URL.
     - **Removing Duplicates**: To avoid redundant downloads, the script removes duplicate URLs using a `Set`.
     - **Downloading Files**: For each unique media URL, the script constructs a file name and path, checks if the file already exists, and if not, proceeds to download it. The file is then marked as hidden using the `makeFileHidden` function.
     - **Error Handling**: If a download fails, the script logs an error message but continues processing the remaining URLs.

5. **Running the Script**
   - The script is executed by calling the `scrapeThread` function with the predefined `BASE_URL`.
   - Any unhandled errors are caught and logged to the console.
   
---

### <center>**Example Workflow**</center>

1. The script initializes and creates the target output folder.
2. It downloads media files from the specified 4chan thread URL.
3. Files are saved to the designated folder and marked as hidden.
4. The script continues processing and logs the status of each operation to the console.

By following these steps, the `4chan Scraper` efficiently collects media files from a 4chan thread, handles existing files intelligently, and provides a seamless experience for archiving and managing media content.

---

###  <center>Installation</center>

---

### <center>Prerequisites</center>

- Ensure you have [Node.js](https://nodejs.org/) (>= 18.17.0) installed on your system. If not, you can use NVM (Node Version Manager) to install it:

### <center>Using NVM</center>

1. **Install NVM**

   NVM allows you to manage multiple versions of Node.js on your system. Follow the [official NVM installation guide](https://github.com/nvm-sh/nvm#installing-and-updating) for your operating system:

   - **On Unix-based systems (Linux, macOS)**:
     Open your terminal and run:

     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
     ```

     After installation, restart your terminal or run:

     ```bash
     source ~/.bashrc
     ```

   - **On Windows**:
     You can use [nvm-windows](https://github.com/coreybutler/nvm-windows). Download and run the installer from the [releases page](https://github.com/coreybutler/nvm-windows/releases).

2. **Install Node.js**

   Once NVM is installed, you can install and use Node.js 18.17.0 by running:

   ```bash
   nvm install 18.17.0
   nvm use 18.17.0
   ```

3. **Clone The Repository**

```bash
git clone https://github.com/Yaimsputnik5/4chan-scraper
```

4. **Install Dependencies**

```bash
npm i
```

5. **Set ThreadIDHere In index.js On Line 8**

```bash
Example: https://boards.4chan.org/b/thread/1
```

6. **Run The Script**

```bash
node index.js
```

---

   ##  <center>License</center>

   ### **This project is governed by The [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.Chtml). You have the freedom to download, modify, and share this code under the conditions specified in the GPL. Any attempt to use this code for malicious purposes is vehemently discouraged, and legal consequences may ensue if caught by authorities.**
   
---

   ##  <center>Credits</center>

   ### <center>- [**Yaimsputnik5**](https://github.com/Yaimsputnik5/)/[Mr.Gibson](https://discord.com/users/1253717160346390538)</center>
   
---

   ### <center>Contributing</center>

   #### <center>[Submit A Question](https://github.com/Yaimsputnik5/4chan-scraper/issues/new?assignees=&labels=question&template=question.md&title=)</center>

   #### <center>[Submit A Suggestion](https://github.com/Yaimsputnik5/4chan-scraper/issues/new?assignees=&labels=suggestion&template=suggestion.md&title=)</center>
   
   #### <center>[Report A Bug](https://github.com/Yaimsputnik5/4chan-scraper/issues/new?assignees=&labels=bug&template=bug-report.md&title=)</center>

   #### <center>[Please Read Our Contribution Guidelines](https://github.com/Yaimsputnik5/4chan-scraper/blob/main/CONTRIBUTING.md)</center>
   
---

   ## <center>Acknowledgements</center>

   ### <center>**Disclaimer**</center>

   The `4chan Scraper` tool is provided for educational and archival purposes only. By using this script, you agree to the following terms and conditions:

   1. **No Affiliation with 4chan**: This script is an independent tool and is not officially affiliated with, endorsed by, or sponsored by 4chan or its parent company. Any use of this script is done at your own risk.

   2. **Responsibility for Use**: The creator of this script assumes no responsibility for any misuse or unintended consequences resulting from its use. It is your responsibility to ensure that your use of this tool complies with 4chan’s terms of service, as well as any applicable laws and regulations.

   3. **Respect for Intellectual Property**: This tool is designed to extract and archive publicly accessible media. However, it is crucial to respect the intellectual property rights of content creators. Unauthorized use or distribution of copyrighted material is prohibited.

   4. **Privacy and Ethics**: This script does not collect personal data or private information. However, users should be mindful of ethical considerations and avoid scraping or using content in ways that infringe on others' privacy.

   5. **No Guarantee of Accuracy**: The script may not be error-free and is provided "as-is" without any warranties or guarantees. The creator is not liable for any issues, errors, or losses that may arise from using this tool.

   6. **Compliance with Terms**: By using this script, you acknowledge and agree to comply with 4chan’s terms of service and any other relevant guidelines or policies.

   If you have any concerns or questions about the legality of using this tool, it is recommended that you seek legal advice.

---

   This section aims to limit liability and clarify the intended use of the script, emphasizing the user's responsibility to comply with relevant terms and laws.
   
   ---