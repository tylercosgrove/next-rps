import Blockies from "react-blockies";
import { useEffect, useState } from "react";
import { BiCopy } from "react-icons/bi";
import { useMoralis, Moralis } from "react-moralis";
import { ethers } from "ethers";

export default function RenderAccount({ accountAddress, isBalance }) {
  const [isClicked, setIsClicked] = useState(false);
  const { web3 } = useMoralis();

  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (isBalance) {
      const fetchBalance = async () => {
        if (!web3 || !accountAddress) {
          return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(accountAddress);
        const balanceInEth = ethers.utils.formatEther(balance);
        setBalance(parseFloat(balanceInEth).toFixed(4));
      };

      fetchBalance();
    }
  }, [web3, accountAddress]);

  const handleButtonClick = () => {
    navigator.clipboard.writeText(accountAddress);
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 100);
  };

  return (
    <>
      <div className="flex items-center gap-2 px-2 py-2 bg-gray-200 w-fit rounded-md">
        {isBalance ? (
          <p className="pr-2 text-xs">
            <span className="font-bold text-slate-700 text-base">
              {balance}
            </span>
            ETH
          </p>
        ) : (
          <></>
        )}
        <Blockies seed={accountAddress.toLowerCase()} />
        <p className="font-mono font-normal">
          {accountAddress.slice(0, 6).toLowerCase()}...
          {accountAddress.slice(-4).toLowerCase()}
        </p>
        <BiCopy
          className={`text-slate-700 cursor-pointer transition-transform duration-150 ease-in-out 
                ${isClicked ? "transform scale-75" : "transform scale-100"}
              `}
          onClick={handleButtonClick}
        />
      </div>
    </>
  );
}
