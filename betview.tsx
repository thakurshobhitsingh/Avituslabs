// src/components/BetView.tsx
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { parseISO, formatDistanceToNowStrict } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import coinIcon from '/assets/avituscoin.svg';

interface LeaderboardEntry {
  userId: number;
  username: string;
  totalProfit: number;
}

interface Bet {
  id: number;
  userId: number;
  roundId: number;
  betAmount: string;
  cashoutMultiplier: string | null;
  profitLoss: string;
  createdAt: string;
}

interface BetViewProps {
  betsTab: 'mybets' | 'top';
  setBetsTab: React.Dispatch<React.SetStateAction<'mybets' | 'top'>>;
  betsData: Bet[] | LeaderboardEntry[];
  isLoading: boolean;
  userId: number;
}

const PAGE_SIZE = 8;

function timeAgo(timestamp: string) {
  try {
    const parsed = parseISO(timestamp);
    return formatDistanceToNowStrict(parsed, { addSuffix: true }).replace('about ', '');
  } catch {
    return 'Invalid time';
  }
}

export const BetView = memo(function BetView({
  betsTab,
  setBetsTab,
  betsData,
  isLoading,
}: BetViewProps) {
  const [page, setPage] = useState(0);
  const startIndex = page * PAGE_SIZE;

  const pageData = useMemo(
    () => betsData.slice(startIndex, startIndex + PAGE_SIZE),
    [betsData, startIndex]
  );

  // Reset to first page when data changes
  const prevLength = useRef(betsData.length);
  useEffect(() => {
    if (prevLength.current !== betsData.length) {
      setPage(0);
      prevLength.current = betsData.length;
    }
  }, [betsData]);

  if (isLoading) {
    return (
      <div className="bg-[#141414] rounded-xl p-6">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!betsData.length) {
    return (
      <div className="bg-[#141414] rounded-xl p-6 text-white text-center">
        No {betsTab === 'mybets' ? 'bets' : 'top players'} found.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#141414] to-[#1a1a1a] rounded-xl p-6 shadow-lg">
      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setPage(0);
              setBetsTab('mybets');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              betsTab === 'mybets'
                ? 'bg-[#222220] text-[#FBFCFC] shadow-md'
                : 'text-[#8A8A8A] hover:bg-[#1F1F1F]'
            }`}
          >
            <img src="/assets/bar.svg" alt="My Bets" className="w-5 h-5" />
            My Bets
          </button>
          <button
            onClick={() => {
              setPage(0);
              setBetsTab('top');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              betsTab === 'top'
                ? 'bg-[#222220] text-[#FBFCFC] shadow-md'
                : 'text-[#8A8A8A] hover:bg-[#1F1F1F]'
            }`}
          >
            <img src="/assets/trophy.svg" alt="Top" className="w-5 h-5" />
            Top
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {betsTab === 'top' ? (
              <tr className="text-[#979797] text-left font-medium">
                <th className="py-3 pl-4">User</th>
                <th className="py-3">Total Profit</th>
              </tr>
            ) : (
              <tr className="text-[#979797] text-left font-medium">
                <th className="py-3 pl-4">Bet Amount</th>
                <th className="py-3">Time</th>
                <th className="py-3">Cashout</th>
                <th className="py-3">Profit & Loss</th>
              </tr>
            )}
          </thead>
          <tbody>
            <AnimatePresence>
              {pageData.map((entry) => {
                const key =
                  betsTab === 'top'
                    ? `top-${(entry as LeaderboardEntry).userId}`
                    : `bet-${(entry as Bet).id}`;

                return (
                  <motion.tr
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                    className="text-white border-b border-[#1F1F1F] hover:bg-[#1F1F1F] transition-colors duration-150"
                  >
                    {betsTab === 'top' ? (
                      <>
                        <td className="py-4 pl-4 font-medium">
                          {(entry as LeaderboardEntry).username}
                        </td>
                        <td>
                          <span
                            className={`font-semibold ${
                              (entry as LeaderboardEntry).totalProfit >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {(entry as LeaderboardEntry).totalProfit >= 0
                              ? `+${Number(
                                  (entry as LeaderboardEntry).totalProfit
                                ).toFixed(2)} AVTS`
                              : `${Number(
                                  (entry as LeaderboardEntry).totalProfit
                                ).toFixed(2)} AVTS`}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 pl-4 flex items-center gap-2">
                          <img src={coinIcon} className="w-5 h-5" alt="coin" />
                          <span className="font-medium">
                            {(entry as Bet).betAmount} AVTS
                          </span>
                        </td>
                        <td className="text-[#B0B0B0]">
                          {timeAgo((entry as Bet).createdAt)}
                        </td>
                        <td className="font-medium">
                          {(entry as Bet).cashoutMultiplier
                            ? `${(entry as Bet).cashoutMultiplier}x`
                            : '-'}
                        </td>
                        <td>
                          <span
                            className={`font-semibold ${
                              parseFloat((entry as Bet).profitLoss) >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {parseFloat((entry as Bet).profitLoss) >= 0
                              ? `+${Number(
                                  (entry as Bet).profitLoss
                                ).toFixed(2)}`
                              : Number((entry as Bet).profitLoss).toFixed(2)}{' '}
                            AVTS
                          </span>
                        </td>
                      </>
                    )}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {betsData.length > PAGE_SIZE && (
        <div className="flex justify-between items-center mt-6 text-sm text-white">
          <button
            className="px-4 py-2 rounded-lg bg-[#222220] hover:bg-[#2A2A2A] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ◄ Previous
          </button>
          <span className="font-medium">
            Page {page + 1} of {Math.ceil(betsData.length / PAGE_SIZE)}
          </span>
          <button
            className="px-4 py-2 rounded-lg bg-[#222220] hover:bg-[#2A2A2A] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={startIndex + PAGE_SIZE >= betsData.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ►
          </button>
        </div>
      )}
    </div>
  );
});
