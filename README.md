# Graph Walker

This is a new project for gradual traversal of a graph.

## Configuration

Edit `data/config.json` to specify how to load your graph data

    {
      "graphDataFile": "<yourdata.json>",
      "useParser": "<parser>",
      "start": {
        "app": "...",
        "model": "<starting model>"
      }
    }

Available JSON parsers are:

- `django` (from `django-extensions` `graph_models` command with `--json` option)
- `sequelize` (custom sequelize parser)


## Running with Docker

Start the Javascript build monitor:

    docker-compose up -d jsmonitor

Start the static web server:

    docker-compose up -d web


Open the following URL in your web browser: [http://localhost:8080/traverse.html](http://localhost:8080/traverse.html)

## Running locally

You'll only need to install the following:

- [node.js](https://nodejs.org/) v4
- [npm](https://github.com/npm/npm) (Node.js package manager)

#### Building

Run the following to install all the necessary build dependencies using [```npm```](https://github.com/npm/npm) and runtime dependencies using [```bower```](http://bower.io/).

    npm install

To expliciltly run a manual build, run the following to bundle all Javascript code into the ```./build``` subdirectory using [```browserify```](http://browserify.org/)

    npm run build

#### Running a Test server

Run the following:

    npm start

(NOTE: This will implicitly run a build)

Open the following URL in your web browser: [http://localhost:8080/traverse.html](http://localhost:8080/traverse.html)

#### Cleanup

To remove build files, run the following:

    npm run clean
