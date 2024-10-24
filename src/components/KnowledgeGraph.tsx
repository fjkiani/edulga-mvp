'use client';
import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge'

interface Node {
  nodeName: string;
  edges: string[];
  description: string;
  tokenID: string;
}

interface Props {
  className?: string;
  data: Node[];
}

const KnowledgeGraph: React.FC<Props> = ({ className, data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 2000, height: 1500 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = svgRef.current;
    const width = 2000;
    const height = 1500;
    const baseNodeRadius = 40;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const nodeMap = new Map(data.map(node => [node.tokenID, node]));
    const nodeSizes = new Map<string, number>();
    data.forEach(node => {
      const size = baseNodeRadius + (node.edges.length * 20);
      nodeSizes.set(node.tokenID, size);
    });

    const nodePositions = calculateNodePositions(data, width, height, nodeSizes);

    // Draw edges
    data.forEach(node => {
      node.edges.forEach(edgeId => {
        if (nodeMap.has(edgeId)) {
          const startPos = nodePositions.get(node.tokenID);
          const endPos = nodePositions.get(edgeId);
          if (startPos && endPos) {
            drawLine(svg, startPos, endPos);
          }
        }
      });
    });

    // Draw nodes
    data.forEach(node => {
      const pos = nodePositions.get(node.tokenID);
      const size = nodeSizes.get(node.tokenID) || baseNodeRadius;
      if (pos) {
        drawNode(svg, pos, size, node.nodeName);
      }
    });

    // Set initial viewBox to show the entire graph
    setViewBox({ x: 0, y: 0, width, height });
  }, [data]);

  const calculateNodePositions = (nodes: Node[], width: number, height: number, nodeSizes: Map<string, number>): Map<string, { x: number; y: number }> => {
    const positions = new Map<string, { x: number; y: number }>();
    const centerX = width / 2;
    const centerY = height / 2;
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, index) => {
      const angle = index * angleStep;
      const radius = Math.min(width, height) * 0.35;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions.set(node.tokenID, { x, y });
    });

    return positions;
  };

  const drawLine = (svg: SVGSVGElement, start: { x: number; y: number }, end: { x: number; y: number }) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', start.x.toString());
    line.setAttribute('y1', start.y.toString());
    line.setAttribute('x2', end.x.toString());
    line.setAttribute('y2', end.y.toString());
    line.setAttribute('stroke', 'white');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  };

  const drawNode = (svg: SVGSVGElement, position: { x: number; y: number }, radius: number, name: string) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', position.x.toString());
    circle.setAttribute('cy', position.y.toString());
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('fill', '#FF4086');
    svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', position.x.toString());
    text.setAttribute('y', position.y.toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = name;
    text.setAttribute('font-size', `${Math.max(10, radius / 4)}px`);
    text.setAttribute('fill', 'white');
    svg.appendChild(text);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;

    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;

    // Increased drag speed by multiplying dx and dy by 2
    setViewBox(vb => ({
      ...vb,
      x: vb.x - dx * 2,
      y: vb.y - dy * 2
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.00001 : 0.00009;
    const newScale = scale * zoomFactor;

    if (newScale < 0.1 || newScale > 10) return; // Limit zoom level

    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    const svgPoint = svgRef.current!.createSVGPoint();
    svgPoint.x = mouseX;
    svgPoint.y = mouseY;
    const pointInGraph = svgPoint.matrixTransform(svgRef.current!.getScreenCTM()!.inverse());

    setViewBox(vb => ({
      x: pointInGraph.x - (mouseX / newScale) * (vb.width / svgRef.current!.clientWidth),
      y: pointInGraph.y - (mouseY / newScale) * (vb.height / svgRef.current!.clientHeight),
      width: vb.width / zoomFactor,
      height: vb.height / zoomFactor
    }));

    setScale(newScale);
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      className={twMerge('', className)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    />
  );
};

export default KnowledgeGraph;