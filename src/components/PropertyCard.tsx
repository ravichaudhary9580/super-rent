import { MapPin, IndianRupee, Bed } from "lucide-react";
import Link from "next/link";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  pricingCycle?: "Monthly" | "Annually";
  occupancy?: string;
  sharingOptions?: string[];
  roomPricings?: Array<{ seater: string; acPrice?: number | null; nonAcPrice?: number | null }>;
  imageUrl?: string;
  href?: string;
}

export function PropertyCard({ id, title, location, price, type, pricingCycle, occupancy, sharingOptions, roomPricings, imageUrl, href }: PropertyCardProps) {
  const targetHref = href || `/properties/${id}`;
  const periodLabel = pricingCycle === "Annually" ? "/year" : "/mo";
  const sharings = sharingOptions && sharingOptions.length > 0 
    ? sharingOptions 
    : (occupancy ? occupancy.split(",").map(s => s.trim()).filter(Boolean) : []);
  const hasRoomPricings = Array.isArray(roomPricings) && roomPricings.length > 0;

  return (
    <Link href={targetHref} className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all">
      <div className="h-48 bg-slate-200 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 group-hover:scale-105 transition-transform duration-500">
            <Bed className="h-12 w-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
          <span>{type}</span>
          {pricingCycle === "Annually" && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black">
              Annual
            </span>
          )}
        </div>

        {sharings.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1 max-w-[90%]">
            {sharings.slice(0, 3).map((sh) => (
              <span key={sh} className="px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-bold text-white shadow-xs">
                {sh}
              </span>
            ))}
            {sharings.length > 3 && (
              <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-bold text-white shadow-xs">
                +{sharings.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1 shrink-0 text-slate-400" /> <span className="truncate">{location}</span>
        </p>
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <div>
            {hasRoomPricings && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                From
              </span>
            )}
            <span className="flex items-center font-extrabold text-slate-900 text-lg">
              <IndianRupee className="h-4 w-4 mr-0.5" /> {price.toLocaleString()}
              <span className="text-sm font-normal text-slate-500 ml-1">{periodLabel}</span>
            </span>
          </div>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
