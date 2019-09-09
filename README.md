# Graphwalker

Provides graphs that you can read!

![graphwalker screenshot](../docs/graphwalker_screenshot.png)

## Introduction

Graphs are are a critical abstract data type underlying much of mathematics and computer science. They provide
a fundamental model for describing newtorking, diagrams, routing, artificial intelligence, etc.

Many advanced software tools exist today to visualize graphs such as [graphviz](http://www.graphviz.org/). However,
data and concepts grow quickly. Although most visualization tools will produce impressive images, reviewing and understanding
them can be overwhelming.

`graphwalker` takes the approach of **salient** visualization:

- Renders **localized** views of a single vertex
- Adjancent vertices (1 degree of separation)
- Pagination for all incoming and outgoing arcs
- Provides reproducible navigation via:
  - Clicking on vertices within the current view
  - Type ahead search for vertex properties
- HTML5 SVG display for easier export and scaling
- [Generalized JSON format](./docs/data_format.md) that is not application specific

## Graph Data

You can quickly produce graphs by using these exporters for these well known applications:

| Application                                      | Exporter                                                                        | Content                      | Platform |
| :----------------------------------------------- | :------------------------------------------------------------------------------ | :--------------------------- | :------- |
| [Airflow](https://airflow.incubator.apache.org/) | [graphwalker-airflow](https://github.com/bijanvakili/graphwalker-airflow)       | DAGs, tasks and dependencies | python   |
| [Django](https://www.djangoproject.com/)         | [graphwalker-django](https://github.com/bijanvakili/graphwalker-django)         | ORM models and relationships | python   |
| [SQLAlchemy](https://www.sqlalchemy.org/)        | [graphwalker-sqlalchemy](https://github.com/bijanvakili/graphwalker-sqlalchemy) | ORM models and relationships | python   |
| [Sequelize](http://docs.sequelizejs.com/)        | [graphwalker-sequelize](https://github.com/bijanvakili/graphwalker-sequelize)   | ORM models and relationships | node.js  |

You can even write your own.

## Configuration

Edit `data/config.json` to specify how to load your graph data

```json
{
  "graph": {
    "url": "your_graph.json",
    "startVertexId": "<SHA1 vertex ID hash>"
  },
  "vertexColumnPageSize": 8,
  "images": { ... },
}
```

The documentation on the JSON data format is [here](./docs/data_format.md).

## Running locally

You'll only need to install the following:

- [node.js](https://nodejs.org/) v6+
- [yarn](https://yarnpkg.com/en/) v0.24+

### Building

Run the following to install all the necessary build dependencies using `yarn` and runtime dependencies using [`webpack`](https://webpack.github.io/).

    yarn install

Run the following to build and bundle all Javascript code into the `./build` subdirectory using [`webpack`](https://webpack.github.io/).

    yarn run build

Run the following in a window to build in watch mode. This will automatically rebuild if you modify any source code.

    yarn run watch

NOTE: `build` must be executed at least once. `watch` will not rebuild 3rd party vendor code.

### Running a Test server

Run the following:

    yarn run web

Open the following URL in your web browser: [http://localhost:9080/index.html](http://localhost:8080/index.html)

NOTE: If you wish to do development while the web server is running, then run `yarn run watch` in a separate window.

### Local Development

Set up the git pre-commit hook as follows:

```sh
  ln -s ../../scripts/pre-commit .git/hooks/pre-commit
```

#### Cleanup

To remove build files, run the following:

    yarn run clean

## Running with Docker

It is recommended to start the development web server in the _foreground_ in a separate console session:

    docker-compose up web

This will allow you to see log output if there is a build error. However, if you wish to run it in the background
and have no output:

    docker-compose up -d web

Open the following URL in your web browser: [http://localhost:9080/index.html](http://localhost:9080/index.html)
