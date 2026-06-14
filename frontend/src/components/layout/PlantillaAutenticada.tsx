import type { ReactNode } from 'react'
import { BarraLateral } from './BarraLateral'
import { BarraSuperior } from './BarraSuperior'

interface Props {
  children: ReactNode
}

export function PlantillaAutenticada({ children }: Props) {
  return (
    <div className="min-h-screen bg-surface">
      <BarraLateral />
      <div className="lg:ml-64 flex flex-col min-h-screen sidebar-transition">
        <BarraSuperior />
        <main className="flex-1 pt-14">
          {children}
        </main>
      </div>
    </div>
  )
}
