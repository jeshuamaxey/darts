# DARTS

## Try The App

A version of the app should be live on the web, hosted by Heroku. You can visit it by clicking [here](http://dartstats.herokuapp.com). Not all features are currently supported on the live version. Its capabilities are changing all the time but as a rule of thumb, expect to be able to view and review data (currently only our own data sets). Logging your own throw data isn't yet possible.


## Local Setup

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

The app requires a server, run with nodemon. To build the front end javascript files also requires browserify. All dependencies will be installed with `npm install`. All this is taken care of by [gulp](https://github.com/gulpjs/gulp).

Once installed just run the gulp command:

````
$ gulp
````

and open up `http://localhost:3000` in your browser and you're good use the app or develop it.

## To Do

- [x] add a 'stats report' pop up which is the exported data presently nicely, instead of the current prepare export routine
- [x] add a link to the heatmap viewer with an argument in the URL containing your standard deviation
- [x] improve the heatmap viewer to read URL arguments
- [x] add bootstrap V3
- [x] make generation of new heatmap optional (and validate sd's)