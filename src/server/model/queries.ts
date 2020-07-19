// Gizmo queries

// TODO update all functions to prevent injection attacks
// TODO dynamically compose these gizmo queries from code

const minVertexQueryNameLength = 2;
const maxVertexMatchResults = 6;

const morphModelProps = `
var morphModelProps = g.M()
 .save("<fq_model_name>", "fullyQualifiedModelName")
 .save("<hash_id>", "hashId")
 .save("<model_name>", "modelName");
`;

const morphFilterTarget = (hashId: string) => `
var morphFilterTarget = g.M().has("<hash_id>", "${hashId}");
`;

export const getVertexByHashId = (hashId: string) => `
${morphModelProps}

${morphFilterTarget(hashId)}

g.V()
 .follow(morphFilterTarget)
 .has("<subject_type>", "/gw/crumb")
 .follow(morphModelProps)
 .all();
`;

export const searchVertices = (nameQuery: string) => {
  if (nameQuery.length < minVertexQueryNameLength) {
    throw new Error("Typeahead query length must be at least 2 characeters");
  }

  return `
${morphModelProps}

var pathModelNodes = g.V()
.has("<subject_type>", "/gw/crumb")

var results = [];

pathModelNodes
 .out("<searchable_properties>")
 .filter(regex("(?i)^${nameQuery}"))
 .in("<searchable_properties>")
 .unique()
 .follow(morphModelProps)
 .forEach(function(v) {
    results.push(v);
 });

results = results.slice(0, ${maxVertexMatchResults})
results.sort(function(a, b) {
  if (a['fullyQualifiedModelName'] < b['fullyQualifiedModelName']) {
    return -1;
  }
  else if (a['fullyQualifiedModelName'] > b['fullyQualifiedModelName']) {
    return 1;
  }
  return 0;
});

results.forEach(function(r) {
  g.emit(r);
});
`;
};

export const findNeighborVertices = (hashId: string) => {
  return `
${morphModelProps}

${morphFilterTarget(hashId)}

g.V()
.follow(morphFilterTarget)
.has("<subject_type>", "/gw/crumb")
.follow(morphModelProps)
.forEach(function(v) {
  g.emit(v);
});

var incomingVertices = g.V()
 .has("<subject_type>", "/gw/crumb")
 .tag("vertex_detail_id")
 .out("</gw/flow>")
 .follow(morphFilterTarget)
 .back()

var outgoingVertices = g.V()
 .has("<subject_type>", "/gw/crumb")
 .tag("vertex_detail_id")
 .in("</gw/flow>")
 .follow(morphFilterTarget)
 .back()

incomingVertices
 .unique()
 .follow(morphModelProps)
 .forEach(function(v) {
  g.emit(v);
 });

outgoingVertices
 .unique()
 .follow(morphModelProps)
 .forEach(function(v) {
  g.emit(v);
 });

`;
};

export const findNeighborEdges = (hashId: string) => {
  return `
${morphModelProps}

${morphFilterTarget(hashId)}

var morphEdgeProps = g.M()
 .save("<hash_id>", "hashId")
 .save("<label>", "label")
 .save("<field_type>", "fieldType")
 .save("<field_name>", "fieldName")
 .save("<multiplicity>", "multiplicity");

var allRelationEdges = g.V()
 .has("<subject_type>", "/gw/flow/detail")
 .tag("edge_detail_id");

var incomingEdges = allRelationEdges
 .out("</gw/flow/detail>")
 .follow(morphFilterTarget)
 .save("<hash_id>", "dest")
 .back("edge_detail_id")
 .in()
 .save("<hash_id>", "source")

var outgoingEdges = allRelationEdges
  .in("</gw/flow/detail>")
  .follow(morphFilterTarget)
  .save("<hash_id>", "source")
  .back("edge_detail_id")
  .out()
  .save("<hash_id>", "dest")

incomingEdges
  .back("edge_detail_id")
  .follow(morphEdgeProps)
  .forEach(function(e) {
    g.emit(e);
  });

outgoingEdges
  .back("edge_detail_id")
  .follow(morphEdgeProps)
  .forEach(function(e) {
    g.emit(e);
  });

`;
};
