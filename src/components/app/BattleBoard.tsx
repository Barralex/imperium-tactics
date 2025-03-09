const BattleBoard = () => {
  const size = 20
  const rows = []

  for (let y = 0; y < size; y++) {
    const cells = []
    for (let x = 0; x < size; x++) {
      cells.push(
        <div
          key={`${x}-${y}`}
          className={`w-6 h-6 border border-gray-800 ${
            (x + y) % 2 === 0 ? 'bg-gray-900/80' : 'bg-black/70'
          }`}
        />
      )
    }
    rows.push(
      <div key={y} className="flex">
        {cells}
      </div>
    )
  }

  return (
    <div className="inline-block border border-gray-700 bg-black/60 p-1 rounded">
      {rows}
    </div>
  )
}

export default BattleBoard
