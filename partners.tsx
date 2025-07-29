import PartnerList from "./partnerlist";

export function Partners(){
    return(
        <div className="p-6 bg-[#131312] rounded-xl shadow-md mt-4 overflow-hidden">
            <h3 className="text-xl font-semibold pb-2">Partners</h3>
            <p className=" text-xs text-[#E3E3E3]">Partnering with the best in the space.</p>
            <PartnerList/>
        </div>
    );
}