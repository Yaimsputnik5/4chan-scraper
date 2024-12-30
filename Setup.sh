#!/bin/sh
clear
echo Deleting Old 4chan-scraper Dependencies
rm -rf node_modules/
rm -rf package-lock.json
clear
echo ------------------------------------------------------------
echo Installing 4chan-scraper Dependencies
npm i
sleep 2
echo ------------------------------------------------------------
echo 4chan-scraper Dependencies Installed Successfully!
echo To Start 4chan-scraper, Run The Run.bat Or Run.sh File
echo Alternatively, You Can Do npm start
echo ------------------------------------------------------------
