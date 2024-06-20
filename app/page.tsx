'use client'

import React, { FC } from 'react'
import { useDraw } from '@/hooks/useDraw'
import { ChromePicker } from 'react-color'
import { useState } from 'react'
interface PageProps { }

const Page: FC<PageProps> = ({ }) => {
  const { canvasRef, onMouseDown, clear } = useDraw(drawLine);
  const [color, setColor] = useState<string>("#000")

  function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = color;
    const lineWidth = 5;

    let startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  return (
    <div className='w-screen h-screen bg-blue- flex justify-center items-center'>
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
    </div>
  );
}

export default Page;
