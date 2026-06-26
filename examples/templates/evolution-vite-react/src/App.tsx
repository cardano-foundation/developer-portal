import Main from "./components/Main"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Evolution SDK Demo</h1>
          <p className="text-sm text-zinc-400">A Vite + React example using Evolution SDK</p>
        </div>
        <Main />
      </div>
    </div>
  )
}

export default App
