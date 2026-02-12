 "use client";
 
 import { Loader2 } from "lucide-react";
 
 interface TransactionOverlayProps {
   title?: string;
   subtitle?: string;
   visible: boolean;
 }
 
 export function TransactionOverlay({
   title = "Transaction Processing",
   subtitle = "Confirm in your wallet…",
   visible,
 }: TransactionOverlayProps) {
   if (!visible) return null;
   return (
     <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-[4px]">
       <div className="rounded-[4px] border border-grid-line bg-[#0A0A0A] p-6 w-full max-w-sm text-center">
         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
         <h4 className="text-sm font-bold uppercase tracking-wider">{title}</h4>
         <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-1">
           {subtitle}
         </p>
       </div>
     </div>
   );
 }
