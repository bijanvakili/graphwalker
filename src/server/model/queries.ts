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

// TODO move this to shared library
export enum IncidentEdgeDirection {
  Incoming = "incoming",
  Outgoing = "outgoing",
}

export const findNeighbors = (hashId: string, edgeDirection: IncidentEdgeDirection) => {
  let subjectPath: string;
  if (edgeDirection === IncidentEdgeDirection.Incoming) {
    subjectPath = "out";
  } else {
    subjectPath = "in";
  }

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

var results = [];

var incomingEdges = allRelationEdges
 .${subjectPath}("</gw/flow/detail>")
 .follow(morphFilterTarget)
 .back("edge_detail_id")
 .follow(morphEdgeProps)
 .forEach(function(edgeData) {
   results.push({"edge": edgeData});
 });

results.forEach(function(result) {
  g.V(result["edge"]["edge_detail_id"])
   .${subjectPath === "out" ? "in" : "out"}("</gw/flow/detail>")
   .follow(morphModelProps)
   .forEach(function(modelData) {
	  result["other"] = modelData;
   });
  delete result["edge"]["edge_detail_id"];
});

results.forEach(function(result) {
  g.emit(result);
});
`;
};
