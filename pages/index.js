import { useState } from "react"

export default function Home() {
  const [clicked, setClicked] = useState(false)

  return <>
    <h1>Some 2 números</h1>
    <label>Numero 1</label>
    <input type="number" />
    <br/>
    <label>Numero 2</label>
    <input type="number" />
    <br/>
    <input type="button" value="Somar" onClick={() => setClicked(true)}/>
    <h2>Resultado: {clicked ? 'Olá Mundo!' : ''}</h2>
  </>
}
