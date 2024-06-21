'use client'

import React, { FC } from 'react'
import { useDraw } from '@/hooks/useDraw'
import { ChromePicker } from 'react-color'
import { useState, useEffect } from 'react'
import { drawLine } from '@/utils/drawLine'
import { io } from 'socket.io-client'
const socket = io('http://localhost:3001')
interface PageProps { }
type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}
const Page: FC<PageProps> = ({ }) => {
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);
  const [color, setColor] = useState<string>("#000")
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")
    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      if (!ctx) return
      drawLine({ prevPoint, currentPoint, ctx, color })
    })

    socket.on('clear', clear)
  }, [canvasRef, clear])


  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', ({ prevPoint, currentPoint, color }))
    drawLine({ prevPoint, currentPoint, ctx, color })
  }

  return (
    <div className='w-screen h-screen bg-blue-700 flex justify-center items-center'>
      <div className='flex flex-col gap-10 pr-10'>
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
        <button type='button' className='p-2 rounded-md border bg-pink-400 text-white border-black' onClick={clear}>
          Clear canvas
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={550}
        height={550}
        className='border border-black rounded-md bg-white'
      />
      <div className='flex flex-col gap-10 pl-10'>

        <button type='button' className='p-2 rounded-md border bg-pink-400 text-white border-black' onClick={() => {
          socket.emit('clear')
        }}>
          Clear canvas
        </button>
      </div>

    </div>
  );
}

export default Page;
