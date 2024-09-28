

import { getDataDB, listPcsPanet } from "@/utils/functions";
import { list } from "postcss";
import { useState } from "react";

export default function Client() {
  const [res, setRes] = useState("");

  /*getDataDB({ type: "listInforme", id: "all" }).then((data) => {
    console.log(JSON.stringify(data));
    setRes(JSON.stringify(data));
  });*/
  listPcsPanet({query:"listPcs"}).then((data)=>{
    console.log("RESPUESTA DEL SEVIDOR: ",JSON.stringify(data))
  })
  return <div className="flex bg-red-200">{res}</div>;
}
