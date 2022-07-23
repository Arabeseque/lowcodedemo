import React, { useContext, useRef, useEffect, useReducer } from 'react';
// import './style/block.scss';
import EditorContext from '../pages/content';

const Block = (props) => {
  const [, forceUpdate] = useReducer(v => v + 1, 0);
  const { config } = useContext(EditorContext);
  const blockRef = useRef();
  const { block, ...otherProps } = props;

  useEffect(() => {
    const { offsetWidth, offsetHeight } = blockRef.current;
    const { style } = block;
    if (block.alignCenter) {
      style.left = style.left - offsetWidth / 2;
      style.top = style.top - offsetHeight / 2;
      block.alignCenter = false;
      forceUpdate();
    }
  }, [block]);
  
  const blockStyle = {
    top: block.style.top,
    left: block.style.left,
    zIndex: block.style.zIndex,
  };

  const component = config.componentMap[block.type];
  const RenderComponent = component.render();

  return (
    <div 
      className={`editor-block absolute ${block.focus ? 'select-none after:block after:-inset-1 after:absolute after:border after:border-dashed  after:border-indigo-600' : ''}`} 
       
      style={blockStyle} 
      ref={blockRef}
      {...otherProps}>
        {RenderComponent}
    </div>
  )
}

export default Block;
