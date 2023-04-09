import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis, Moralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import crypto from "crypto-browserify";
import RenderAccount from "./RenderAccount";
import Loading from "./Loading";

const abi2 = require("ethereumjs-abi");

export default function EnterBet() {
  const { chainId: chainIdHex, isWeb3Enabled, web3, account } = useMoralis();

  const chainId = parseInt(chainIdHex);
  const rpsAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const [gameCreator, setGameCreator] = useState("");
  const [currBetSize, setCurrBetSize] = useState("");
  const [recentWinner, setRecentWinner] = useState("");

  const [loadingStartGame, setLoadingStartGame] = useState(false);
  const [loadingTakeBet, setLoadingTakeBet] = useState(false);
  const [loadingReveal, setLoadingReveal] = useState(false);

  const [player2, setPlayer2] = useState("");

  const [selectedChoice, setSelectedChoice] = useState("rock");
  const [selectedBetSize, setSelectedBetSize] = useState("0");
  const [isCreatingBet, setIsCreatingBet] = useState(false);

  useEffect(() => {
    updateUI();
  }, [account]);

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isCreatingBet]);

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const updateUI = async () => {
    const gameCreatorFromContract = ((await getGameCreator()) || "").toString();
    setGameCreator(gameCreatorFromContract);

    const player2FromContract = ((await getPlayer2()) || "").toString();
    setPlayer2(player2FromContract);

    const betSizeFromContract = ((await getBetSize()) || "").toString();
    setCurrBetSize(
      betSizeFromContract == ""
        ? ""
        : ethers.utils.formatEther(betSizeFromContract)
    );

    const recentWinnerFromContract = (
      (await getRecentWinner()) || ""
    ).toString();
    setRecentWinner(recentWinnerFromContract);
  };

  const { runContractFunction: getGameCreator } = useWeb3Contract({
    abi: abi,
    contractAddress: rpsAddress,
    functionName: "getGameCreator",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: rpsAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const { runContractFunction: getPlayer2 } = useWeb3Contract({
    abi: abi,
    contractAddress: rpsAddress,
    functionName: "getPlayer2",
    params: {},
  });

  const { runContractFunction: getBetSize } = useWeb3Contract({
    abi: abi,
    contractAddress: rpsAddress,
    functionName: "getBetSize",
    params: {},
  });

  const getCommit = () => {
    const nonce = "0x" + crypto.randomBytes(32).toString("hex");
    let choice = "0";
    if (selectedChoice == "paper") {
      choice = "1";
    } else if (selectedChoice == "scissors") {
      choice = "2";
    }
    //console.log(choice);
    const RPSPlayer1Commit =
      "0x" +
      abi2
        .soliditySHA3(["uint256", "uint256"], [choice, nonce])
        .toString("hex");
    console.log(RPSPlayer1Commit);
    if (typeof window !== "undefined") {
      //console.log("saved!");
      window.localStorage.setItem(
        "betData",
        JSON.stringify({ nonce: nonce, choice: choice })
      );
    }

    return RPSPlayer1Commit;
  };

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    console.log(tx);
    console.log("successful!");
    setIsCreatingBet(false);
    setLoadingStartGame(false);
  };

  const handleComplete = () => {
    console.log("completed!");
  };

  const handleStartGame = async () => {
    const _player1Commit = getCommit();
    setLoadingStartGame(true);
    await startGame({
      params: {
        abi: abi,
        contractAddress: rpsAddress,
        functionName: "startGame",
        params: {
          _player1Commit: _player1Commit,
        },
        msgValue: ethers.utils.parseEther(selectedBetSize),
      },
      onError: (error) => {
        console.log("ERROR:");
        console.log(error);
        setLoadingStartGame(false);
      },
      onSuccess: (tx) => tx.wait(1).then(handleSuccess(tx)),
      onComplete: handleComplete,
    });
    console.log("done starting game!");
  };

  const myVar = () => {
    return getCommit();
  };

  const {
    runContractFunction: startGame,
    isLoading,
    isFetching,
  } = useWeb3Contract();

  const getCurrentBet = () => {
    return (
      <>
        <div>
          <p className="font-bold	text-xl">Current bet:</p>

          <div className="flex items-center gap-5">
            <p>Created by:</p>
            <RenderAccount accountAddress={gameCreator} />
          </div>
          <p>
            Bet size: <span className="font-bold">{currBetSize}</span>ETH
          </p>
          {CHOICES.map((choice) => (
            <div
              key={choice[0]}
              className={`flex gap-x-2 justify-start mt-2 w-40 px-3 py-3 rounded-md cursor-pointer drop-shadow-sm	items-center
              ${
                selectedChoice == choice[0].toLocaleLowerCase()
                  ? "bg-blue-500 text-white font-bold"
                  : "bg-slate-200"
              }`}
              onClick={() => {
                setSelectedChoice(choice[0].toLocaleLowerCase());
              }}
            >
              <input
                type="radio"
                value={choice[0].toLocaleLowerCase()}
                checked={selectedChoice == choice[0].toLocaleLowerCase()}
                onChange={handleChoiceChange}
              />
              {"   "}
              {choice[0]}
              <div className="grow text-right text-xl">{choice[1]}</div>
            </div>
          ))}
          <button
            disabled={loadingTakeBet}
            className={` text-white font-bold py-2 px-4 rounded ml-auto mt-6 ${
              loadingTakeBet ? "bg-blue-300" : "hover:bg-blue-700 bg-blue-500"
            }`}
            onClick={handleTakeBet}
          >
            <p className="w-24">{loadingTakeBet ? <Loading /> : "Take Bet"}</p>
          </button>
        </div>
      </>
    );
  };

  const handleTakeBet = async () => {
    let choice = "0";
    if (selectedChoice == "paper") {
      choice = "1";
    } else if (selectedChoice == "scissors") {
      choice = "2";
    }
    console.log(choice);
    setLoadingTakeBet(true);
    await takeBet({
      params: {
        abi: abi,
        contractAddress: rpsAddress,
        functionName: "takeBet",
        params: {
          _player2Choice: choice,
        },
        msgValue: ethers.utils.parseEther(currBetSize),
      },
      onError: (error) => {
        console.log("ERROR:");
        console.log(error);
        setLoadingTakeBet(false);
      },
      onComplete: () => {},
      onSuccess: (tx) =>
        tx.wait(1).then(() => {
          console.log("yes!");

          updateUI();
          setLoadingTakeBet(false);
        }),
    });
  };

  const { runContractFunction: takeBet } = useWeb3Contract();

  const CHOICES = [
    ["ROCK", "🪨"],
    ["PAPER", "📝"],
    ["SCISSORS", "✂️"],
  ];

  const handleChoiceChange = (e) => {
    setSelectedChoice(e.target.value);
  };

  const handleBetSizeChange = (e) => {
    let tempBetSize = e.target.value;
    const regex = /^(\d*\.?\d*)$/;
    if (regex.test(tempBetSize) || tempBetSize === "") {
      setSelectedBetSize(tempBetSize);
    }
  };

  const handleBlur = () => {
    let newValue = selectedBetSize;

    if (newValue.startsWith(".")) {
      newValue = "0" + newValue;
    } else {
      newValue = newValue.replace(/^0+/, "");
      if (newValue === "" || newValue === "0") {
        newValue = "0";
      } else if (parseFloat(newValue) < 1) {
        newValue = "0" + newValue;
      }
    }
    setSelectedBetSize(newValue);
  };

  const getCreateBet = () => {
    return (
      <>
        <div className="">
          <p
            className={` w-fit ${
              loadingStartGame
                ? "text-slate-500 cursor-default"
                : "text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
            }`}
            onClick={() => {
              if (!loadingStartGame) setIsCreatingBet(false);
            }}
          >
            Back
          </p>
          <p className="font-bold text-xl">Create Bet</p>
          {CHOICES.map((choice) => (
            <div
              key={choice[0]}
              className={`flex gap-x-2 justify-start mt-2 w-40 px-3 py-3 rounded-md cursor-pointer drop-shadow-sm	items-center
              ${
                selectedChoice == choice[0].toLocaleLowerCase()
                  ? "bg-blue-500 text-white font-bold"
                  : "bg-slate-200"
              }`}
              onClick={() => {
                setSelectedChoice(choice[0].toLocaleLowerCase());
              }}
            >
              <input
                type="radio"
                value={choice[0].toLocaleLowerCase()}
                checked={selectedChoice == choice[0].toLocaleLowerCase()}
                onChange={handleChoiceChange}
              />
              {"   "}
              {choice[0]}
              <div className="grow text-right text-xl">{choice[1]}</div>
            </div>
          ))}
          <p className="mt-6">Bet size:</p>
          <div className="flex items-end">
            <input
              type="text"
              className={`border-b-4 text-2xl w-32 focus:outline-none ${
                parseFloat(selectedBetSize) == 0 || selectedBetSize.length == 0
                  ? "border-red-500"
                  : "focus:border-neutral-600"
              }`}
              value={selectedBetSize}
              onChange={handleBetSizeChange}
              onBlur={handleBlur}
            />
            <p className="text-2xl">
              ETH{" "}
              <span className="text-red-500 text-xs">
                {parseFloat(selectedBetSize) == 0 || selectedBetSize.length == 0
                  ? "*bet must be greater than 0"
                  : ""}
              </span>
            </p>
          </div>
          <button
            disabled={
              loadingStartGame ||
              parseFloat(selectedBetSize) == 0 ||
              selectedBetSize.length == 0
            }
            className={`text-white font-bold py-2 px-4 rounded ml-auto mt-6 ${
              loadingStartGame ||
              parseFloat(selectedBetSize) == 0 ||
              selectedBetSize.length == 0
                ? "bg-blue-300"
                : "hover:bg-blue-700 bg-blue-500"
            }`}
            onClick={handleStartGame}
          >
            <p className="w-24">
              {loadingStartGame ? <Loading /> : "Create Bet"}
            </p>
          </button>
        </div>
      </>
    );
  };

  const noBetYet = () => {
    return (
      <>
        {isCreatingBet ? (
          getCreateBet()
        ) : (
          <>
            <p className="font-bold	text-xl">No current bet.</p>
            <div className="flex items-center gap-5">
              <p>Recent winner:</p>
              <span className="font-bold">
                {recentWinner ==
                "0x0000000000000000000000000000000000000000" ? (
                  "Tie"
                ) : (
                  <RenderAccount accountAddress={recentWinner} />
                )}
              </span>
            </div>
            <button
              className={`text-white font-bold py-2 px-4 rounded ml-auto bg-blue-500 hover:bg-blue-700`}
              onClick={() => {
                setIsCreatingBet(true);
              }}
            >
              Create Bet
            </button>
          </>
        )}
      </>
    );
  };

  const handleReveal = async () => {
    let tempPlayer1Choice = "";
    let tempNonce = "";

    if (typeof window != undefined) {
      let localObj = JSON.parse(window.localStorage.getItem("betData"));
      tempPlayer1Choice = localObj["choice"];
      tempNonce = localObj["nonce"];
    }
    setLoadingReveal(true);

    await reveal({
      params: {
        abi: abi,
        contractAddress: rpsAddress,
        functionName: "reveal",
        params: {
          player1Choice: tempPlayer1Choice,
          nonce: tempNonce,
        },
      },
      onError: (error) => {
        console.log("ERROR:");
        console.log(error);
        setLoadingReveal(false);
      },
      onComplete: () => {},
      onSuccess: (tx) =>
        tx.wait(1).then(() => {
          console.log("yes!");
          updateUI();
          setLoadingReveal(false);
        }),
    });
    console.log("revealed!");
  };

  const { runContractFunction: reveal } = useWeb3Contract();

  return (
    <>
      <div className="mt-6">
        {rpsAddress ? (
          <div>
            {gameCreator == "0x0000000000000000000000000000000000000000" ? (
              noBetYet()
            ) : (
              <>
                {player2 == "0x0000000000000000000000000000000000000000" ? (
                  getCurrentBet()
                ) : (
                  <>
                    <p className="font-bold 	text-xl">
                      Bet has been proposed and taken.
                    </p>
                    <div className="flex items-center gap-5">
                      <p>Proposed by:</p>
                      <RenderAccount accountAddress={gameCreator} />
                    </div>
                    <div className="flex items-center gap-5 mt-2">
                      <p>Taken by:</p>
                      <RenderAccount accountAddress={player2} />
                    </div>
                    <p>
                      Wager: <span className="font-bold">{currBetSize}</span>
                      ETH
                    </p>
                    {account.toLowerCase() == gameCreator.toLowerCase() ? (
                      <>
                        <button
                          disabled={loadingReveal}
                          onClick={handleReveal}
                          className={`text-white font-bold py-2 px-4 rounded ml-auto ${
                            loadingReveal
                              ? "bg-blue-300"
                              : "bg-blue-500 hover:bg-blue-700"
                          }`}
                        >
                          <p className="w-24">
                            {loadingReveal ? <Loading /> : "Reveal"}
                          </p>
                        </button>
                      </>
                    ) : (
                      <p>Waiting for owner to reveal...</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <>You need to connect to a wallet.</>
        )}
      </div>
    </>
  );
}
