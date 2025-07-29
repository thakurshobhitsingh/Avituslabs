import { useEffect, useState } from "react";
import { Submission, useIsTaskStore, useTaskStore, useUserStore } from "@/helpers/userStore";
import useSWR from "swr";
// import { fetchTasks } from "@/helpers/userauth";
import { ScrollArea } from "./ui/scrollbar";

export function TaskCard() {
  const { tasks, fetchTasksFromServer } = useTaskStore();
  const { setIsTaskStore } = useIsTaskStore();
  const userData = useUserStore((s) => s.userData);
  const username = userData?.customUsername ?? userData?.username;
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");

  // Fetching tasks using SWR and calling store function to set tasks
  const { data, error} = useSWR<Submission[]>(
    username ? `/user/quests/${username}` : null,
    // () => fetchTasks(username!),
    {
      // refreshInterval: 7000,
      revalidateOnFocus: false, 
      refreshWhenHidden: false, 
      refreshWhenOffline:false,
      
    }

  );

  useEffect(() => {
    if (data) {
      fetchTasksFromServer(username!); 
    }
  }, [data, fetchTasksFromServer, username]);

  useEffect(() => {
    // console.log("Fetched tasks from store:", tasks); 
    if (tasks.length > 0) {
      setIsTaskStore(true);
    } else {
      setIsTaskStore(false);
    }
    // console.log("IsTaskStore:", isTaskStore);
  }, [tasks]);


  if (error || !Array.isArray(tasks)) {
    return <div>Error loading tasks. Please try again later.</div>;
  }

  const filterTasks = () => {
    if (activeTab === "pending") return tasks.filter((t) => !t.status);
    if (activeTab === "approved") return tasks.filter((t) => t.status);
    return tasks;
  };

  const formatTimeAgo = (submittedAt: string) => {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffMs = now.getTime() - submitted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `Submitted ${diffHours} hours ago`;
    const days = Math.floor(diffHours / 24);
    return `Submitted ${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <>
    <div className="flex gap-4 mb-4">
        {["all", "pending", "approved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer hover:text-white ${
              activeTab === tab ? "bg-[#1F1F1F] text-white" : "text-[#8A8A8A] "
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
  <ScrollArea className="h-[400px] pr-2 rounded-md ">

      <div className="flex flex-col gap-4">
        {filterTasks()?.length === 0 ? (
          <div className="flex flex-col items-center text-sm font-medium gap-2 text-[#8A8A8A] py-10">
            <img src="/assets/frogstand.svg" />
             <p className="text-white text-md">
              {activeTab === "approved"
                ? "No approved submissions yet."
                : activeTab === "pending"
                ? "No pending submissions yet."
                : "No submissions yet."}
            </p>
            {activeTab === "all"
              ? "The galaxy is waiting—make your first move and start earning points."
              : "Check back later or complete a new quest."}
          </div>
        ) : (
          filterTasks()?.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center bg-[#1A1918] p-6 border border-[#2D2D2A] rounded-lg shadow-md"
            >
              <div>
                <div className="flex gap-2 mb-2 items-center">
                  <h3 className="text-sm font-medium">{task.questType}</h3>
                  <span
                    className={`text-xs font-medium flex row gap-2 py-1 px-2 rounded-full ${
                      task.status ? "text-[#FF9000] bg-[#FFDA341A]" : "text-[#E3E3E3] bg-[#222220]"
                    }`}
                  >
                    {task.status ? (
                      <>
                        Approved
                        <img src="/assets/approved.svg" />
                      </>
                    ) : (
                      <>
                        Pending
                        <img src="/assets/clock.svg" />
                      </>
                    )}
                  </span>
                </div>
                <div className="flex flex-row items-center gap-4">
                  <p className="text-xs text-[#8A8A8A]">{formatTimeAgo(task.submittedAt)}</p>
                  {task.pointsAwarded && (
                    <div className="flex flex-row items-center gap-2 justify-center">
                      <img src="/assets/avituscoin.svg" />
                      <p className="text-sm mt-1 text-[#FFD700] font-medium">+{task.pointsAwarded} AVTS</p>
                    </div>
                  )}
                </div>
              </div>
              <a href={task.link} target="_blank" rel="noopener noreferrer">
                <button className="text-sm font-medium bg-[#222220] rounded-md shadow-md py-3 px-10 cursor-pointer hover:opacity-80">
                  View
                </button>
              </a>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
    </>
  );
}
