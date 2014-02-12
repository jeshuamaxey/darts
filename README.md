# DARTS

## Setup

Run `npm install` after pulling. You'll need to symlink to a directory full of relevant data of the form:

````
data
├── dummy.json
├── output.json
├── symmetric
│   ├── sd-000.5.json
│   ├── sd-001.0.json
 ~ ~ ~
│   ├── sd-050.0.json
│   ├── sd-100.0.json
│   ├── sd-150.0.json
│   ├── sd-200.0.json
│   └── sd-250.0.json
└── throw-data
    ├── 000.json
    ├── 001.json
    └── 002.json
````

Jack to do this simply copy and paste the following command from the route of the repo:

````
$ ln -s < path/to/shared/dropbox/folder > public/data
````

replacing `path/to/shared/dropbox/folder` with the actual path to the folder we're using for the project. For instance, on my machine, I ran:

````
$ ln -s ~/Dropbox/data/darts-data/ public/data
````

The web app visualiser won't work unless you start a server in the route directory. I've built us a basic on in node. Open up a terminal window and run:

````nodemon index.js````

Note: npm should install nodemon for you. If it doesn't, run 'npm install -g nodemon' and then try running the server again.

To edit the javascript you'll need to run [gulp](https://github.com/gulpjs/gulp) (Sorry for having to install ANOTHER thing, but I suspect a `npm install` should do everything for you). This is so we can modularise all of our javascript 'The Node Way' (tm) and use it where ever we like.

Once installed open up a separate terminal window and just run the gulp command:

````
$ gulp
````

Then just open up `http://localhost:3000` in your browser and you'll see ~~`public/data/darts.json`~~ plotted on a heatmap.

## To Do

- [x] add a 'stats report' pop up which is the exported data presently nicely, instead of the current prepare export routine
- [x] add a link to the heatmap viewer with an argument in the URL containing your standard deviation
- [x] improve the heatmap viewer to read URL arguments
- [x] add bootstrap V3