import { TaskCard } from "./taskcard";

export function Connect2Boost() {
    return (
        <div className="bg-[#141414] w-full mx-auto shadow-md rounded-xl p-6 ">
            <h3 className="font-semibold text-lg">Your Contributions</h3>
            <p className="text-[#979797] font-medium text-sm mb-6">Connect, engage & earn more with every click.</p>
            <TaskCard/>
        </div>
    );
}