import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { NavItem } from "../components/nav-item";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full bg-gray-50">
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-5">
              <Link className="flex items-center gap-2 font-semibold" href="/">
                {/* <Logo /> */}
                <span className="font-bold text-2xl">BOITCenter</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-md font-medium">
                <ul className="menu  rounded-box w-56">
                  <li>
                    <details>
                      <summary>
                        <FontAwesomeIcon icon={"bug"}></FontAwesomeIcon>
                        Inventario de alarmas
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
                  <li>
                    <details>
                      <summary>
                        <FontAwesomeIcon icon={"file-pen"}></FontAwesomeIcon>
                        Auditorias
                      </summary>
                    </details>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">
            <Link
              className="flex items-center gap-2 font-semibold lg:hidden"
              href="/"
            >
              {/* <Logo /> */}
              <span className="">BOITCenter</span>
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
