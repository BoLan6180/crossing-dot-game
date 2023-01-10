import { GameBoard } from './gameui/gameboard'
import { ConfigProvider } from './gameui/ConfigProvider'
import { Options } from './gameui/options'
import { Header } from './gameui/Header'
import { Footer } from './gameui/Footer'

function App() {
  return (
    <>
      <Header />
      <ConfigProvider>
        <GameBoard />
        <Options />
      </ConfigProvider>
      <Footer />
    </>
  )
}

export default App
