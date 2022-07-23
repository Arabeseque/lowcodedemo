import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import SchemaJSON from './schema.json'
import { useState,useRef,useCallback,useReducer } from 'react'
import config from './config'
import Block from '../components/Block'
import { Provider } from './content';
import clone from '../utils/deepCopy'

export default function Home() {
  const currentMaterial = useRef(); // 记录当前拖拽的物料组件
  const [schema, setSchema] = useState(SchemaJSON)

  const [, forceUpdate] = useReducer(v => v + 1, 0);

  const handleDragStart = (component) => {
    currentMaterial.current = component;
  }

  //拖拽元素移动到画布时，触发此事件；比如可以改变拖拽光标手势；
  const handleDragEnter = event => event.dataTransfer.dropEffect = 'move';

  //拖拽元素停留在画布时，会持续触发此事件；需要通过它来取消默认事件，保证元素正常触发 onDrop 事件；
  const handeDragOver = event => event.preventDefault();

  //拖拽元素离开画布时，触发此事件；
  const handleDragLeave = event => event.dataTransfer.dropEffect = 'none';
  
  //对于画布来说，最重要的一个拖拽事件，当拖拽元素在画布上放置（松开鼠标）时触发此事件。
  const handleDrop = event => {
    const { offsetX, offsetY } = event.nativeEvent;
    schema.blocks.push({
      type: currentMaterial.current.type,
      alignCenter: true,
      focus: false,
      style: {
        width: undefined,
        height: undefined,
        left: offsetX,
        top: offsetY,
        zIndex: 1,
      },
    });
    setSchema(clone(schema));
    currentMaterial.current = null;
    forceUpdate()
  }

  const blocksFocusInfo = useCallback(() => {
    let focus = [], unfocused = [];
    schema.blocks.forEach(block => (block.focus ? focus : unfocused).push(block));
    return { focus, unfocused };
  }, [schema]);
  
  const cleanBlocksFocus = (refresh) => {
    schema.blocks.forEach(block => block.focus = false);
    refresh && setSchema(clone(schema));
    forceUpdate()

  }
  
  const dragState = useRef({ 
    startX: 0, // 移动前 x 轴位置
    startY: 0, // 移动前 y 轴位置
    startPos: [] // 移动前 所有 focus block 的位置存储
  });

  const handleMouseDown = (e, block) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (e.shiftKey) {
      const { focus } = blocksFocusInfo();
      // 当前只有一个被选中时，按住 shift 键不会切换 focus 状态
      block.focus = focus.length <= 1 ? true : !block.focus;
    } else {
      if (!block.focus) {
        cleanBlocksFocus();
        block.focus = true;
      }
    }
    
    setSchema(clone(schema));
    forceUpdate()

    handleBlockMove(e);
  }
  
  const handleBlockMove = (e) => {
    const { focus } = blocksFocusInfo();
    // 1、记录鼠标拖动前的位置信息，以及所有选中元素的位置信息
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: focus.map(({ style: { top, left } }) => ({ top, left })),
    }

    const blockMouseMove = (e) => {
      const { clientX: moveX, clientY: moveY } = e;
      const durX = moveX - dragState.current.startX;
      const durY = moveY - dragState.current.startY;

      focus.forEach((block, index) => {
        block.style.top = dragState.current.startPos[index].top + durY;
        block.style.left = dragState.current.startPos[index].left + durX;
      })
      
      setSchema(clone(schema));
      forceUpdate()
    }

    const blockMouseUp = () => {
      document.removeEventListener('mousemove', blockMouseMove);
      document.removeEventListener('mouseup', blockMouseUp);
    }

    // 2、通过 document 监听移动事件，计算每次移动的新位置，去改变 focus block 的 top 和 left
    document.addEventListener('mousemove', blockMouseMove);
    document.addEventListener('mouseup', blockMouseUp);
  }

  
  const handleClickCanvas = event => {
    event.stopPropagation();
    cleanBlocksFocus(true);
  }
  
  console.log(schema)
  
  return (
    <Provider value={{config}}>
      <div className="editor-wrapper bg-zinc-50">
        <div className="p-3 text-2xl text-center editor-header">顶部工具栏</div>
        <div className="flex items-start justify-between editor-main">
          <div className="editor-left">
            <div className='p-2 text-xl font-bold'>左侧物料区</div>
            {config.componentList.map(component => (
              <div
                draggable
                onDragStart={() => handleDragStart(component)}
                key={component.type}
                className="p-2 border editor-left-item"
              >
                <span>{component.label}</span>
                <div>{component.preview()}</div>
              </div>
            ))}
          </div>
          <div className="relative editor-container">
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handeDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onMouseDown={handleClickCanvas}
              id="canvas-container"
              style={{...schema.container}}
              className="bg-white"
            >
              {schema.blocks.map((block, index) => (
                <Block key={index} block={block} onMouseDown={e => handleMouseDown(e, block)}></Block>
              ))}
              <div
                className="p-2 text-xl font-bold"
              >
                编辑区 - 画布
              </div>
              
            </div>
          </div>
          <div className="p-2 text-xl font-bold editor-right">右侧属性区</div>
        </div>
      </div>
    </Provider>
    
  )
}
