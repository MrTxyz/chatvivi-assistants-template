export type VendorCardProps = {
  title: string; desc_vi?: string; desc_en?: string; offer?: string; url: string
}
export function VendorCard({ title, desc_vi, desc_en, offer, url }: VendorCardProps){
  return (
    <div className="card p-4 mb-3">
      <div className="text-sm opacity-70 mb-1">Gợi ý dịch vụ</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm mt-1">{desc_vi || desc_en}</div>
      {offer ? <div className="text-xs mt-1 opacity-70">{offer}</div> : null}
      <a href={url} target="_blank" rel="noopener" className="btn btn-primary mt-3">Mở liên kết</a>
    </div>
  )
}
