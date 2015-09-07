# Graph Walker

This is a new project for gradual traversal of a graph.

## Build Requirements

You'll only need to install the following:

- [node.js](https://nodejs.org/)
- [npm](https://github.com/npm/npm) (Node.js package manager)

## Building

Run the following to install all the necessary build dependencies using [```npm```](https://github.com/npm/npm) and runtime dependencies using [```bower```](http://bower.io/).

    npm install

To expliciltly run a manual build, run the following to bundle all Javascript code into the ```./build``` subdirectory using [```browserify```](http://browserify.org/)

    npm run build

To remove build files, run the following:

    npm run clean

## Running a Test server

Run the following:

    npm start

(NOTE: This will implicitly run a build)

Open the following URL in your web browser: [http://localhost:8888/traverse.html](http://localhost:8888/traverse.html)
