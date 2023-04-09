import Head from "next/head";
import Image from "next/image";
import Blockies from "react-blockies";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { BiCopy } from "react-icons/bi";
import RenderAccount from "./RenderAccount";

export default function ManualHeader() {
  const [isClicked, setIsClicked] = useState(false);

  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;

    if (typeof window !== undefined) {
      if (window.localStorage.getItem("connected")) {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  const handleButtonClick = () => {
    navigator.clipboard.writeText(account);
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 100);
  };

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      // console.log(`account changed to ${account}`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        // console.log("Null account found.");
      }
    });
  }, []);

  return (
    <>
      <div className="p-5 border-b-2 flex items-center">
        <div className="py-4 px-4 ">
          <h1 className="font-bold text-3xl">rock, paper, scissors!</h1>
          <p>
            view contract on{" "}
            <span
              className="cursor-pointer hover:underline text-blue-500"
              onClick={() => {
                if (typeof window != undefined) {
                  window.open(
                    "https://sepolia.etherscan.io/address/0x430c8e7B37d3041984c431b8bE68a9d44956719F"
                  );
                  console.log(
                    "https://sepolia.etherscan.io/address/0x430c8e7B37d3041984c431b8bE68a9d44956719F"
                  );
                }
              }}
            >
              etherscan
            </span>
          </p>
        </div>
        <div className="ml-auto py-2 px-4">
          {account ? (
            <RenderAccount accountAddress={account} isBalance={true} />
          ) : (
            <button
              className={` text-white font-bold py-2 px-4 rounded hover:bg-blue-700 bg-blue-500`}
              onClick={async () => {
                await enableWeb3();
                if (typeof window != undefined) {
                  window.localStorage.setItem("connected", "injected");
                }
              }}
              disabled={isWeb3EnableLoading}
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </>
  );
}
