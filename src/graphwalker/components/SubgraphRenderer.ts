import * as d3 from 'd3-selection';
import classnames from 'classnames';

import { IncidentEdgeDirection, Edge, Graph, Vertex } from '../models/Graph';
import { Settings } from '../models/Settings';
import { Point } from '../../types/ObjectTypes';
import { ImageIdentifier, Justification } from '../constants';

import 'images/basic_node.svg';
import '../GraphComponents.less';

const svgTemplatePrefix = 'svgTemplate_';
const viewMarginX = 10;
const viewMarginY = 15;
const vertexIconMargin: Point = { x: 2, y: 2 };
const vertexTextMarginY = 5;
const neighborMarginY = 18;
const vertexTextHeight = 14;
const edgeTextHeight = 12;

// TODO change this once SVG2 is supported
const attrHref = 'xlink:xlink:href';

export type VertexSelectedCallback = (vertexId: string) => void;
type NeighborSelections = { [key in IncidentEdgeDirection]: number };

interface SubgraphProps {
  svg: SVGSVGElement;
  graph: Graph;
  settings: Settings;
  onClickVertex: VertexSelectedCallback;
}

interface VertexLayoutData {
  position: Point;
  justification: Justification;
}

type JustificationNoCenter = Justification.Left | Justification.Right;

interface EdgeLayoutData {
  segments: Point[]; // segments are drawn left to right
  justification: JustificationNoCenter;
}

interface GraphLayout {
  vertices: {
    [vertexId: string]: VertexLayoutData;
  };
  edges: {
    [edgeId: string]: EdgeLayoutData;
  };
}

export function getPaginatedList(items: any[], offset: number, pageSize: number) {
  return items.slice(offset, offset + pageSize);
}

export function getPointsPath(segments: Point[]): string {
  return segments.map((p: Point) => `${p.x},${p.y}`).join(' ');
}

// renders a subgraph: the neighorhood of the current vertices
export class SubgraphRenderer {
  // TODO optimize to reduce linear searches
  private svg: SVGSVGElement;
  private graph: Graph;
  private settings: Settings;
  private onClickVertex: VertexSelectedCallback;
  private vertexGroupHeight: number;

  constructor(props: SubgraphProps) {
    this.svg = props.svg;
    this.graph = props.graph;
    this.settings = props.settings;
    this.vertexGroupHeight =
      props.settings.images.vertexIcon.height + vertexTextHeight + 2 * vertexIconMargin.y + neighborMarginY;
    this.onClickVertex = props.onClickVertex;
  }

  // entry point to graph the localized subgraph
  render(currentVertexId: string, neighborSelections: NeighborSelections) {
    // remove pre-existing objects to force a redraw
    this.remove();

    const images = this.settings.images;
    const svgSelection = this.selectSvg();

    // add image templates
    svgSelection
      .selectAll('symbol')
      .data(Object.keys(images))
      .enter()
      .append('symbol')
      .attr('id', (key: string) => `${svgTemplatePrefix}${key}`)
      .append('image')
      .attr(attrHref, (key: string) => `images/${images[key].filename}`)
      .attr('width', (key: string) => images[key].width)
      .attr('height', (key: string) => images[key].height);

    const incomingEdges = getPaginatedList(
      this.graph.getIncidentEdges(currentVertexId, IncidentEdgeDirection.Incoming),
      neighborSelections.incoming,
      this.settings.vertexColumnPageSize
    );
    const outgoingEdges = getPaginatedList(
      this.graph.getIncidentEdges(currentVertexId, IncidentEdgeDirection.Outgoing),
      neighborSelections.outgoing,
      this.settings.vertexColumnPageSize
    );

    const layout = this.getGraphLayout(currentVertexId, incomingEdges, outgoingEdges);
    const onClickVertexElement = (vertexId: string) => {
      const e = d3.event;
      e.stopPropagation();
      e.preventDefault();
      this.onClickVertex(vertexId);
    };

    const drawRootSelection: d3.Selection<d3.BaseType, Vertex, SVGGElement, any> = svgSelection
      .append('g')
      .selectAll('g');

    // add placholder groups (<g>) for each vertex
    const vertexPlaceholders = drawRootSelection
      .data(Object.keys(layout.vertices))
      .enter()
      .append('g')
      .attr('transform', (vertexId: string) => {
        const { position } = layout.vertices[vertexId];
        return `translate(${position.x} ${position.y})`;
      });

    // draw the vertex icons
    vertexPlaceholders
      .append('use')
      .attr(attrHref, `#${svgTemplatePrefix}${ImageIdentifier.VertexIcon}`)
      .attr('x', vertexIconMargin.x)
      .attr('y', vertexIconMargin.y)
      .on('click', onClickVertexElement);

    // draw the vertex labels
    const vertexTextXOffsets = {
      [Justification.Left]: vertexIconMargin.x,
      [Justification.Center]: vertexIconMargin.x + this.settings.images.vertexIcon.width / 2,
      [Justification.Right]: vertexIconMargin.x + this.settings.images.vertexIcon.width
    };
    vertexPlaceholders
      .append('text')
      .attr('class', (vertexId: string) =>
        classnames('graph-vertex-label', layout.vertices[vertexId].justification)
      )
      .text((vertexId: string) => this.graph.findVertexById(vertexId).label)
      .attr('x', (vertexId: string) => vertexTextXOffsets[layout.vertices[vertexId].justification])
      .attr('y', this.vertexGroupHeight - neighborMarginY + vertexTextMarginY)
      .on('click', onClickVertexElement);

    // disable click handler for target vertex
    vertexPlaceholders
      .data([currentVertexId])
      .selectAll('use, text')
      .on('click', null);

    // add placeholder groups (<g>) for each edge
    const edgePlaceholders = drawRootSelection
      .data(Object.keys(layout.edges))
      .enter()
      .append('g');

    // draw the segmented path for each edge
    const edgeXOffsets = {
      [Justification.Left]: vertexIconMargin.x + this.settings.images.vertexIcon.width - 1,
      [Justification.Right]: vertexIconMargin.x + 1
    };
    edgePlaceholders
      .append('polyline')
      .attr('class', 'graph-edge-line')
      .attr('points', (edgeId: string) => {
        const justification = layout.edges[edgeId].justification;
        const adjustedSegments = layout.edges[edgeId].segments.map((segment: Point) => ({
          x: segment.x + edgeXOffsets[justification],
          y: segment.y + vertexIconMargin.y + this.settings.images.vertexIcon.height / 2
        }));
        if (justification === Justification.Left) {
          adjustedSegments[3].x -= this.settings.images.vertexIcon.width - vertexIconMargin.x;
        } else {
          adjustedSegments[0].x += this.settings.images.vertexIcon.width - vertexIconMargin.x;
        }
        return getPointsPath(adjustedSegments);
      });

    // draw the edge labels
    edgePlaceholders
      .append('text')
      .attr('class', (edgeId: string) => classnames('graph-edge-label', layout.edges[edgeId].justification))
      .attr('x', (edgeId: string) => {
        const edge = this.graph.findEdgeById(edgeId);
        const justification = layout.edges[edgeId].justification;
        const anchoredVertexX =
          justification === Justification.Left
            ? layout.vertices[edge.source].position.x
            : layout.vertices[edge.dest].position.x;

        return anchoredVertexX + edgeXOffsets[justification];
      })
      .attr('y', (edgeId: string) => {
        const justification = layout.edges[edgeId].justification;
        const edge = this.graph.findEdgeById(edgeId);
        const anchoredVertexY =
          justification === Justification.Left
            ? layout.vertices[edge.source].position.y
            : layout.vertices[edge.dest].position.y;
        return (
          anchoredVertexY + vertexIconMargin.y + this.settings.images.vertexIcon.height / 2 + edgeTextHeight
        );
      })
      .text((edgeId: string) => this.graph.findEdgeById(edgeId).label);

    // TODO draw the arrow indicators
    const currentTargetPosition = layout.vertices[currentVertexId].position;
    const arrowPositionX = {
      [Justification.Left]: (5 / 6) * (currentTargetPosition.x - viewMarginX),
      [Justification.Right]: (7 / 6) * (currentTargetPosition.x - viewMarginX)
    };
    const enabledArrows: JustificationNoCenter[] = [];
    if (incomingEdges.length > 0) {
      enabledArrows.push(Justification.Left);
    }
    if (outgoingEdges.length > 0) {
      enabledArrows.push(Justification.Right);
    }

    drawRootSelection
      .data(enabledArrows)
      .enter()
      .append('use')
      .attr(attrHref, `#${svgTemplatePrefix}${ImageIdentifier.Arrow}`)
      .attr('x', (justification: JustificationNoCenter) => arrowPositionX[justification])
      .attr(
        'y',
        currentTargetPosition.y +
          vertexIconMargin.y +
          this.settings.images.vertexIcon.height / 2 -
          this.settings.images.arrow.height / 2
      );
  }

  // removes all d3 content (during unmount)
  remove() {
    this.selectSvg()
      .selectAll('*')
      .remove();
  }

  private selectSvg(): d3.Selection<SVGSVGElement, any, d3.BaseType, any> {
    return d3.select(this.svg);
  }

  /*
   * Hierarchical Layout algorithm for subgraph
   *
   * 3 static hierarchies directed horizontall from left to right
   *  1) incoming
   *  2) target vertex (center)
   *  3) outgoing
   * - filter incoming and outgoing vertices with pagination (offset and max size)
   */
  private getGraphLayout(currentVertexId: string, incomingEdges: Edge[], outgoingEdges: Edge[]): GraphLayout {
    const layout: GraphLayout = {
      vertices: {},
      edges: {}
    };

    const svgWidth = this.svg.getBoundingClientRect().width;

    // place the target vertex in the center
    layout.vertices[currentVertexId] = {
      position: { x: svgWidth / 2, y: viewMarginY },
      justification: Justification.Center
    };
    const targetVertexPosition = layout.vertices[currentVertexId].position;

    // place the incoming vertices and edges on the left
    const incomingVertices = incomingEdges.map((edge: Edge) => this.graph.findVertexById(edge.source));
    if (incomingVertices.length > 0) {
      incomingVertices.forEach((v: Vertex, idx: number) => {
        layout.vertices[v.id] = {
          position: { x: viewMarginX, y: viewMarginY + idx * this.vertexGroupHeight },
          justification: Justification.Left
        };
      });
      const segmentDiffX = (targetVertexPosition.x - layout.vertices[incomingVertices[0].id].position.x) / 3;
      incomingEdges.forEach((e: Edge) => {
        const startPosition = layout.vertices[e.source].position;
        layout.edges[e.id] = {
          segments: [
            startPosition,
            { x: startPosition.x + segmentDiffX, y: startPosition.y },
            { x: startPosition.x + 2 * segmentDiffX, y: targetVertexPosition.y },
            targetVertexPosition
          ],
          justification: Justification.Left
        };
      });
    }

    // place the outgoing vertices on the right
    // add outgoing vertices
    if (outgoingEdges.length > 0) {
      const outgoingVertices = outgoingEdges.map((edge: Edge) => this.graph.findVertexById(edge.dest));
      const outgoingPositionX = svgWidth - viewMarginX - this.settings.images.vertexIcon.width;

      outgoingVertices.forEach((v: Vertex, idx: number) => {
        layout.vertices[v.id] = {
          position: { x: outgoingPositionX, y: viewMarginY + idx * this.vertexGroupHeight },
          justification: Justification.Right
        };
      });

      const segmentDiffX = (layout.vertices[outgoingVertices[0].id].position.x - targetVertexPosition.x) / 3;
      outgoingEdges.forEach((e: Edge) => {
        const endPosition = layout.vertices[e.dest].position;
        layout.edges[e.id] = {
          segments: [
            targetVertexPosition,
            { x: targetVertexPosition.x + segmentDiffX, y: targetVertexPosition.y },
            { x: targetVertexPosition.x + 2 * segmentDiffX, y: endPosition.y },
            endPosition
          ],
          justification: Justification.Right
        };
      });
    }

    return layout;
  }
}
