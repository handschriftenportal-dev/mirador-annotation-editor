import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {Transformer, Shape, Line} from 'react-konva';

/** FreeHand shape displaying */
function Polygon({
  activeTool, fill, height, onShapeClick, points, isSelected, shape, stroke, strokeWidth, width, x, y,
}) {
  // TODO check if selectedShapeId is needed
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, shape]);


  /** */
  const handleClick = () => {
    console.log("FreeHand handleClick shape id", shape.id);
    onShapeClick(shape);
  };

  return (
  
    <>
      <Line
          ref={shapeRef}
          id={shape.id}
          points={shape.points}
          stroke={shape.stroke || 'black'}
          strokeWidth={5}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          closed={false}
          onClick={handleClick}
          fill={fill || 'red'}
          draggable={activeTool === 'cursor' || activeTool === 'edit'}
          globalCompositeOperation="source-over"
      />

      <Transformer
        ref={trRef}
        visible={activeTool === 'edit' && isSelected}
      />
    </>
  );
}

Polygon.propTypes = {
  activeTool: PropTypes.string.isRequired,
  fill: PropTypes.string,
  height: PropTypes.number,
  onShapeClick: PropTypes.func.isRequired,
  points: PropTypes.arrayOf(PropTypes.number),
  shape: PropTypes.object.isRequired,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
  width: PropTypes.number,
};

Polygon.defaultProps = {
  fill: 'red',
  height: 1080,
  points: [0, 0, 100, 0, 100, 100],
  stroke: 'black',
  strokeWidth: 1,
  width: 1920,
};

export default Polygon;
