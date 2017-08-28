# Graphwalker JSON format

## Introduction

The data format is meant to be non-application specific as `graphwalker` to be a general graph visualization tool.

## General structure

The JSON currently only provides two root level properties which represent arrays of vertices and edges.

```json
{
  "vertices": [
    ...
  ],
  "edges": [
    ...
  ]
}
```

### Vertex format

```json
{
  "id": "fb7a0fe33d793ac7f0c86391fe4fd450677af4c3",
  "label": "Fancy Pants Vertex",

  "searchableComponents": ["Fancy", "Pants"],

  "properties": {
      ...
  }
}
```

|Property|Type    |Required|Description|
|:-------|:-------|:------:|:----------|
|`id`|_string_|Y|Unique identifier for vertex. [SHA1](https://en.wikipedia.org/wiki/SHA-1) hashes are recommended|
|`label`|_string_|Y|Human readable display name|
|`searchableComponents`|_array_|N|Strings to match against the vertex for  type-ahead search|
|`properties`|_object_|N|Free form user-defined properties (anything that is valid JSON)|

### Edge Format

```json
[     
  {
    "id": "1d942b8a57669a54d067591f07ac0d1c917413c1",
    "label": "inheritance",

    "source": "c51ae819a2f6c83be2585b75ac650959b78866d9",
    "dest": "d629496c37d7f808029091d5d2d02e07d72c134e",

    "properties": {...}
  },
  ...
]
```

|Property|Type    |Required|Description|
|:-------|:-------|:------:|:----------|
|`id`|_string_|Y|Unique identifier for edge|
|`label`|_string_|Y|Human readable display name|
|`source`|_string_|Y|`id` of the source (originating) vertex for this edge|
|`dest`|_string_|Y|`id` of the destination (terminating) vertex for this edge|
|`properties`|_object_|N|Free form user-defined properties (anything that is valid JSON)|

## Future items

* TODO Refactor JSON into a _serialization_ format for large graph data sources
* TODO URLs for representation images


Graph
    vertices
    edges
    
Vertex
    id
    label (displayName)
    searchableComponents
    properties {}
    
Edge
    id
    source
    dest
    label
    properties {}
    
