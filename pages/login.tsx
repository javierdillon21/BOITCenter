import Image from "next/image";
import Header from "../components/header";

export default function Login() {
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 p-6">
      <Header title="BOITCenter"></Header>
      <div className="flex flex-col h-96 w-80 self-center p-5 gap-6 bg-white border rounded shadow-lg">
        <span className="flex flex-col gap-y-0.5">
          <p className="font-semibold text-2xl">Iniciar sesión</p>
          <p className="font-normal text-xs">
            Ingrese sus credenciales de la intranet
          </p>
        </span>

        <span className="flex flex-col gap-y-4">
          <input
            className="input input-sm input-bordered w-full h-10 rounded"
            placeholder="Usuario"
          ></input>
          <input
            className="input input-sm input-bordered w-full h-10 rounded"
            placeholder="Contraseña"
            type="password"
          ></input>
        </span>
        <button className="btn btn-sm btn-outline rounded-full h-10">Ingresar</button>
        <Image src={"/ClaroLogo.png"} width={80} height={80} alt="logoClaro" className="self-center mt-5"></Image>
        </div>
    </div>
  );
}
