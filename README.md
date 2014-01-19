# DARTS

## Setup

run `npm install` after pulling.

The web app visualiser won't work unless you start a server in the route directory. I've built us a basic on in node. Open up a terminal window and run:

````nodemon index.js````

Note: npm should install nodemon for you. If it doesn't, run 'npm install -g nodemon' and then try running the server again.

Then just open up `http://localhost:3000` in your browser and you'll see `public/data/darts.json` plotted on a heatmap.