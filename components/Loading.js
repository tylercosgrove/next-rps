import { useState, useEffect } from "react";

export default function Loading() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      let dotString = "";
      for (let i = 0; i < count % 4; i++) {
        dotString += ".";
      }
      setDots(dotString);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <p className="w-20 text-start"> Loading{dots}</p>
    </>
  );
}
