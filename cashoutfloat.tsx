// import { useEffect, useState } from "react";
// import { onCashoutSuccess } from "@/helpers/socket";
// import { motion, AnimatePresence } from "framer-motion";

// type CashoutData = {
//   userId: number;
//   reward: number;
//   cashedOutAt: number;
// };

// export function CashoutFloat() {
//   const [floatData, setFloatData] = useState<CashoutData | null>(null);

//   useEffect(() => {
//     onCashoutSuccess(({ userId, reward, cashedOutAt }: CashoutData) => {
//       setFloatData({ userId, reward, cashedOutAt });

//       // Clear after 3 seconds
//       setTimeout(() => setFloatData(null), 3000);
//     });
//   }, []);

//   return (
//     <div className="absolute top-10 left-10 z-50 pointer-events-none">
//       <AnimatePresence>
//         {floatData && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.5 }}
//             className="bg-[#FFDA34] bg-opacity-10 backdrop-blur-md text-white px-3 py-1 rounded-xl shadow-md"
//           >
//             <p className="text-sm font-semibold">User #{floatData.userId} cashed out!</p>
//             <p className="text-xs">🏆 x{floatData.cashedOutAt.toFixed(2)} | 💰 ${floatData.reward.toFixed(2)}</p>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
