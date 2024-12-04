import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { NavItem } from "../components/nav-item";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div id="layout" className="flex h-full bg-gray-50">
      <div className="grid min-h-screen w-full lg:grid-cols-[220px_1fr]">
        <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
          <div id="vertical_sidebar" className="flex h-full max-h-screen flex-col gap-2 sticky">
            <div className="flex h-[60px] items-center border-b px-5">
              <Link className="flex flex-col font-semibold" href="/">
                {/* <Logo /> */}
                <Image
                src={"/ClaroLogo.png"}
                width={75}
                height={75}
                alt="logoClaro"
                className=""
              ></Image>
                <span className="font-semibold text-md">BOITCenter</span>
              </Link>
            </div>
            <div className="flex flex-1 flex-col py-2 justify-between">
              <nav className="grid items-start text-md font-medium">
                <ul className="menu rounded-box w-56">
                  <li>
                    <details>
                      <summary>
                        <FontAwesomeIcon icon={"bug"}></FontAwesomeIcon>
                        Vulnerabilidades AIC
                      </summary>
                      <ul>
                        <NavItem href="/report">
                          <FontAwesomeIcon
                            icon={"box-archive"}
                          ></FontAwesomeIcon>
                          Informes
                        </NavItem>
                        <NavItem href="/hardware">
                          <FontAwesomeIcon icon={"computer"}></FontAwesomeIcon>
                          Equipos
                        </NavItem>
                        <li>
                          <details>
                            <summary>
                              <FontAwesomeIcon icon={"gear"}></FontAwesomeIcon>
                              Gestión
                            </summary>
                            <ul>
                              <NavItem href="/manage/import">
                                <FontAwesomeIcon
                                  icon={"file-import"}
                                ></FontAwesomeIcon>
                                Importar datos
                              </NavItem>
                            </ul>
                          </details>
                        </li>
                      </ul>
                    </details>
                  </li>
                 {/*<li>
                    <details>
                      <summary>
                        <FontAwesomeIcon icon={"search"}></FontAwesomeIcon>
                        Auditorias
                      </summary>
                    </details>
                  </li>*/}
                </ul>
              </nav>
              
            </div>
          </div>
          {/*<Image
                src={"/ClaroLogo.png"}
                width={80}
                height={80}
                alt="logoClaro"
                className="pl-4 pb-2"
              ></Image>*/}
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">
            <Link
              className="flex flex-col font-semibold lg:hidden"
              href="/"
            >
              <Image
                src={"/ClaroLogo.png"}
                width={75}
                height={75}
                alt="logoClaro"
                className=""
              ></Image>
                <span className="font-semibold text-md">BOITCenter</span>
            </Link>
            {/* <User /> */}
          </header>
          {children}
        </div>
      </div>
      {/* <Analytics /> */}
    </div>
  );
}
