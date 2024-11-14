import berry from "url:~assets/IconBerry.png";
import rocket from "url:~assets/IconRocket.png";
import jump from "url:~assets/IconJump.png";



const SuccessConnected = () => {
  return <div>
    <div className="w-full mt-[10px] ">
      <div className="  mx-[25px] flex gap-[10px] flex-col">
        <div className="flex bg-[#F5F5F5] items-center justify-between px-5 py-3 text-sm ">
          <span className="font-normal leading-4 ">
            Network Quality:
          </span>
          <span className="font-bold leading-4 text-[#4281FF] ">
            50%
          </span>
        </div>

        <div className="bg-[#F5F5F5]  px-5 py-3 ">
          <div className="flex justify-between text-[10px] font-normal leading-3 text-[#999999]">
            <span>Accumulated Rewards</span>
            <span>Extra Boost</span>
          </div>
          <div className="flex justify-between font-bold leading-5 text-5 mt-[10px]">
            <div className="flex items-center gap-[10px]">
              <span className="">35.42</span>
              <img src={berry} alt="berry" />
            </div>
            <div className="flex items-center gap-[10px]">
              <span className="">1.5x</span>
              <img src={rocket} alt="rocket" />
            </div>
          </div>


          <div className="flex justify-between text-[10px] font-normal leading-3 text-[#999999] mt-5">
            <span>Berry Baby</span>
            <span>Small Berry</span>
          </div>
          <div className="!w-full progress-bar my-[6px]">
            <div className="progress" style={{ width: '30%' }}>
            </div>
          </div>
          <div className="flex justify-between font-bold leading-5 text-5 ">
            <div className="flex items-center gap-[10px]">
              <span className="">36/100</span>
              <span className="font-medium text-[10px] ">EXP</span>
            </div>



          </div>

        </div>
        <button className="text-base font-medium btn mt-[40px]">
          Copy Referral Link
        </button>
      </div>


    </div>

  </div>
}

export default SuccessConnected