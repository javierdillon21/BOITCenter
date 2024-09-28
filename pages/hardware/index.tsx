"use client";
import { token } from "@/utils/token";
import Header from "../../components/header";
import { useState } from "react";

export default function Equipos() {
  const [res, setRes] = useState("");
  // const response = async () =>{
  //     await fetch("http://10.191.204.61/api/auth/login", {
  //       method: "POST",
  //       mode: "cors",
  //       headers:{
  //         "Content-Type": "application/json"
  //       },
  //       body : JSON.stringify({
  //         username:"Administrator",
  //         password: "Claro2021!"
  //       })
  //     })
  //   }

  //   post("http://10.191.204.61/proactivanet/api/Pcs",{
  //     data:{
  //       "username":"Administrator",
  //       "password": "Claro2021!"
  //     }
  //   } )

  async function post(url = "", data = {}) {
    const response = await fetch(url, {
      method: "GET",
      //credentials: "omit",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
      },

      //   body: JSON.stringify(data),
    });
    return response;
  }
  post("http://10.191.204.61/proactivanet/api/Pcs").then((data) => {
    console.log("dataobj: ", data);
    setRes(JSON.stringify(data));
  });
  console.log("repsonse:", res);

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <Header title="Todos los Equipos"></Header>
      <input type={"date"} className="input"></input>
    </main>
  );
}
