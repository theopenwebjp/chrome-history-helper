# Description

Copies files from Chrome History.
This libary is for copying history data to a CSV.
sqlite3 is required to use this library. Test by executing:`sqlite3 --version`.
bash is required for shell commands.
CURRENTLY ONLY WINDOWS! PLEASE CONTACT FOR OTHER SUPPORT REQUESTS.

## Usage

All results are generated in ./results/
To do steps 1 & 2 use `npm run csv`.
To do steps 3 & 4 use `npm run download`.

1. Copy history file to other location(because may be in use by Chrome and always good to work from copy). Example using Git Bash.
`npm run copy`

2. Create CSV file. Requires sqlite3 installed.
`npm run create-csv`

3. Download history(History files must have been generated.).
`npm run download-history`

4. Download domain views
`npm run download-domain-views`

## Details

Format is DATE,URL.
Want to get just URLS.
Then take array of URLS and get domains only.
Then take that array and map to object with {count}.

## Related

* [https://github.com/christiangenco/chrome-export-history](History csv export from Chrome extension)