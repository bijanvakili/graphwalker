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

- [node.js](https://nodejs.org/) v6+
- [yarn](https://yarnpkg.com/en/) v0.24+

#### Building

Run the following to install all the necessary build dependencies using `yarn` and runtime dependencies using [```webpack```](https://webpack.github.io/).

    yarn install

Run the following to build and bundle all Javascript code into the ```./build``` subdirectory using [```webpack```](https://webpack.github.io/).

    yarn run build

Run the following in a window to build in watch mode.  This will automatically rebuild if you modify any source code.

    yarn run watch

NOTE: `build` must be executed at least once.  `watch` will not rebuild 3rd party vendor code.

#### Running a Test server

Run the following:

    yarn run web

Open the following URL in your web browser: [http://localhost:8080/index.html](http://localhost:8080/index.html)

NOTE: If you wish to do development while the web server is running, then run `yarn run watch` in a separate window.

#### Cleanup

To remove build files, run the following:

    yarn run clean
