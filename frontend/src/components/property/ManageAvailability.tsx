import { useState } from 'react';
import { useHostBlocks, useBlockAvailability, useUnblockAvailability } from '../../features/avaiability/availability.hooks';
import toast from 'react-hot-toast';
import { Trash2, AlertCircle, Plus, Calendar as CalIcon } from 'lucide-react';

export function ManageAvailability({ propertyId }: { propertyId: string }) {
  const { data, isLoading } = useHostBlocks(propertyId);
  const blockMutate = useBlockAvailability();
  const unblockMutate = useUnblockAvailability();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleBlock = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      toast.error("End date must be after start date.");
      return;
    }

    try {
      await blockMutate.mutateAsync({
        propertyId,
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString()
      });
      toast.success("Time range blocked successfully.");
      setStartDate('');
      setEndDate('');
    } catch (error: any) {
      toast.error(error?.response?.data?.msg || "Failed to block time range.");
    }
  };

  const handleUnblock = async (blockId: string) => {
    try {
      await unblockMutate.mutateAsync(blockId);
      toast.success("Date range unblocked successfully.");
    } catch (error: any) {
       toast.error(error?.response?.data?.msg || "Failed to unblock.");
    }
  };

  const blocks = data?.blocks || [];

  return (
    <div className="w-full bg-[#111111] border border-white/5 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <CalIcon size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Manual Availability Controls</h3>
          <p className="text-xs text-zinc-500">Block or unblock dates instantly across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ADD BLOCK SECTION */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Issue New Block</p>
          <div className="flex items-center gap-3">
             <div className="flex-1 space-y-1">
               <label className="text-[10px] text-zinc-500 uppercase font-medium pl-1">Start Date</label>
               <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
               />
             </div>
             <div className="flex-1 space-y-1">
               <label className="text-[10px] text-zinc-500 uppercase font-medium pl-1">End Date</label>
               <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
               />
             </div>
          </div>
          <button 
             onClick={handleBlock}
             disabled={blockMutate.isPending || !startDate || !endDate}
             className="w-full flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-semibold text-xs py-2.5 rounded-lg border border-indigo-500/20 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            {blockMutate.isPending ? "Executing..." : "Inject Blocked Range"}
          </button>
        </div>

        {/* CURRENT BLOCKS SECTION */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Active Overrides</p>
          
          <div className="max-h-[140px] overflow-y-auto custom-scrollbar pr-1 space-y-2">
            {isLoading ? (
               <p className="text-xs text-zinc-500 animate-pulse">Loading active overrides...</p>
            ) : blocks.length === 0 ? (
               <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#0a0a0a] py-6 px-4">
                  <AlertCircle size={16} className="text-zinc-600 mb-2" />
                  <p className="text-xs text-zinc-500 text-center">No structural blocks applied</p>
               </div>
            ) : (
               blocks.map((block: any) => (
                 <div key={block.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-red-500/10">
                   <div className="flex flex-col">
                      <span className="text-xs font-medium text-red-400">Restricted Range</span>
                      <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
                         {new Date(block.startTime).toLocaleDateString()} - {new Date(block.endTime).toLocaleDateString()}
                      </span>
                   </div>
                   <button 
                      onClick={() => handleUnblock(block.id)}
                      disabled={unblockMutate.isPending}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-colors disabled:opacity-50"
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
