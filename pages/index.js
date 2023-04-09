import Image from "next/image";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import ManualHeader from "@/components/ManualHeader";
import Head from "next/head";
import EnterBet from "@/components/EnterBet";

export default function Home() {
  return (
    <>
      <Head>
        <title>Rock Paper Scissors</title>
        <meta name="description" content="Smart contract lottery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-screen-md m-auto px-4">
        <ManualHeader />
        <EnterBet />
      </div>
    </>
  );
}
