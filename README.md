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
- `sqlalchemy` (custom SQLAlchemy parser in `script/sqlalchemy`)
- `sequelize` (custom sequelize parser in `script/sequelize`)


## Running with Docker

It is recommended to start the development web server in the _foreground_ in a separate console session:

    docker-compose up web

This will allow you to see log output if there is a build error.  However, if you wish to run it in the background
and have no output:

    docker-compose up -d web

Open the following URL in your web browser: [http://localhost:8080/index.html](http://localhost:8080/index.html)

## Running locally

You'll only need to install the following:

- [node.js](https://nodejs.org/) v4
- [npm](https://github.com/npm/npm) (Node.js package manager)

#### Building

Run the following to install all the necessary build dependencies using [```npm```](https://github.com/npm/npm) and runtime dependencies using [```bower```](http://bower.io/).

    npm install

To explicitly run a manual build, run the following to bundle all Javascript code into the ```./build``` subdirectory using [```webpack```](https://webpack.github.io/).

    npm run build

#### Running a Test server

Run the following:

    npm start

(NOTE: This will implicitly run a build)

Open the following URL in your web browser: [http://localhost:8080/index.html](http://localhost:8080/index.html)

#### Cleanup

To remove build files, run the following:

    npm run clean
