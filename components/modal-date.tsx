import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

export default function ModalWithChild(props: {
  title: string;
  text: string;
  icon?: string | IconProp;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-25 z-50`}
    >
      <div className="flex flex-col justify-between bg-white rounded-xl shadow-xl h-52 sm:w-1/2 lg:w-1/4">
        <div className="flex flex-row h-auto gap-5 p-5 w-full">
          <FontAwesomeIcon
            icon={(props.icon as IconProp) || "info-circle"}
            size="2xl"
            className="pt-2 text-slate-700"
          ></FontAwesomeIcon>
          <span className="flex flex-col text-gray-600 gap-2">
            <p className="text-black font-bold text-lg">{props.title}</p>
            <p className="mb-4 text-sm">{props.text}</p>
          </span>
        </div>
        <div className="flex flex-col w-full justify-center">
          {" "}
          {props.children}
        </div>
      </div>
    </div>
  );
}
