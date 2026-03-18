import React from 'react'
export default function FiltersBar({onChange}){
  return (
    <div className="p-2 flex gap-2 items-center">
      <select onChange={e=>onChange({category:e.target.value})} className="border p-1">
        <option value="">All categories</option>
        <option value="coding">coding</option>
        <option value="research">research</option>
        <option value="automation">automation</option>
      </select>
      <input placeholder="Search" onChange={e=>onChange({q:e.target.value})} className="border p-1" />
      <input type="date" onChange={e=>onChange({start:e.target.value})} className="border p-1" />
      <input type="date" onChange={e=>onChange({end:e.target.value})} className="border p-1" />
      <button onClick={()=>onChange({export:true})} className="bg-blue-500 text-white px-2 py-1 rounded">Export CSV</button>
    </div>
  )
}
