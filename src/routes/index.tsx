import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <p className="text-sm text-slate-500">stack ready</p>
    </main>
  )
}
