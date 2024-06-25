'use client'

import React, { FC, useState, useEffect } from 'react'
import { useDraw } from '@/hooks/useDraw'
import { ChromePicker } from 'react-color'
import { drawLine } from '@/utils/drawLine'
import { io } from 'socket.io-client'
import { Card, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const socket = io('https://painting-canvas-backend-1.onrender.com')

interface PageProps { }
type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}
type Draw = {
  prevPoint: Point | null
  currentPoint: Point
  ctx: CanvasRenderingContext2D
}

const Page: FC<PageProps> = ({ }) => {
  const [name, setName] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(true);
  const [participants, setParticipants] = useState<string[]>([]);
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);
  const [color, setColor] = useState<string>("#000")

  // inside your Page component's useEffect
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")
    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      if (!ctx) return
      drawLine({ prevPoint, currentPoint, ctx, color })
    })


    socket.on('clear', clear)

    socket.on('participants', (updatedParticipants: string[]) => {
      setParticipants(updatedParticipants);
    })
  }, [canvasRef, clear, name])


  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', { prevPoint, currentPoint, color })
    drawLine({ prevPoint, currentPoint, ctx, color })
  }

  function handleEnter() {
    if (name) {
      setDialogOpen(false);
      socket.emit('name', name);
    }
  }

  return (
    <div className='min-h-screen bg-purple-300 flex flex-wrap justify-center items-center'>
      <Dialog open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleEnter();
              }}
            />
            <Button
              onClick={handleEnter}
              disabled={!name}
              className='mt-4'
            >
              Enter
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {!dialogOpen && (
        <div className='flex flex-col '>

          <div className='text-yellow-950 text-4xl text-center font-bold mb-4'>Welcome, {name}!</div>

          <div className='flex items-center gap-10 '>
            <div className='mt-0'>
              <CardHeader className='text-purple-950 font-bold text-2xl '>Participants</CardHeader>
              <div className=''>
                {participants.map(participant => (
                  <Card key={participant} className='flex flex-col items-center my-2 '>

                    <div className='w-full h-[2em] my-1 mx-1 flex justify-center item-center bg-green-300 font-bold text-purple-900'>{participant}</div>
                  </Card>
                ))}
              </div>
            </div>


            <canvas
              ref={canvasRef}
              onMouseDown={onMouseDown}
              width={550}
              height={550}
              className='border border-black rounded-md bg-white mt-10'
            />
            <div className='flex flex-col gap-10 px-10'>
              <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
              <button
                type='button'
                className='p-2 rounded-md border bg-pink-400 text-white border-black'
                onClick={() => {
                  socket.emit('clear')
                }}
              >
                Clear canvas
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Page;
