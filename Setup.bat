@echo off
color 02
cls
title Deleting Old 4chan-scraper Dependencies
echo Deleting Old 4chan-scraper Dependencies
rmdir /S /Q node_modules/
del /F /S /Q package-lock.json
cls
echo ------------------------------------------------------------
title Installing 4chan-scraper Dependencies
echo Installing 4chan-scraper Dependencies
npm i
sleep 2
echo ------------------------------------------------------------
echo 4chan-scraper Dependencies Installed Successfully!
echo To Start 4chan-scraper, Run The Run.bat Or Run.sh File
echo Alternatively, You Can Do npm start
echo ------------------------------------------------------------
