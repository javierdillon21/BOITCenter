import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function Modal(props: {
  title: string;
  text: string;
  actionSubmit: () => void;
  textButtonAction: string;
  icon?: string;

  onClose: () => void;
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
            <p className="mb-4">{props.text}</p>
          </span>
        </div>
        <div className="flex flex-row h-auto gap-2 p-3 w-full bg-gray-50 rounded-b-xl justify-end">
          <button
            className="btn btn-outline btn-sm btn-neutral flex shadow-md"
            onClick={props.onClose}
          >
            Cancelar
          </button>
          <button
            onClick={props.actionSubmit}
            className="btn btn-sm btn-warning flex shadow-md"
          >
            {props.textButtonAction}
          </button>
        </div>
      </div>
    </div>
  );
}
