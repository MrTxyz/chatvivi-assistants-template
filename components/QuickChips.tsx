type Chip = { label: string, value: string }
export function QuickChips({ items, onPick }:{ items: Chip[]; onPick:(v:string)=>void }){
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {items.map((c)=> (
        <button key={c.value} onClick={()=>onPick(c.value)}
          className="badge hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">{c.label}</button>
      ))}
    </div>
  )
}
