import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import SchemaJSON from './schema.json'
import { useState } from 'react'

export default function Home() {
  const [schema, setSchema] = useState(SchemaJSON)
  console.log(schema)
  return (
    <div className="editor-wrapper">
      <div className="editor-header">顶部工具栏</div>
      <div className="editor-main">
        <div className="editor-left">左侧物料区</div>
        <div className="editor-container">
          <div id="canvas-container" style={{...schema.container}}>
            编辑区 - 画布
          </div>
        </div>
        <div className="editor-right">右侧属性区</div>
      </div>
    </div>
  )
}
