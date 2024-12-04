import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export const AlertTypes = {
  warning: { icon: "warning", classname: "text-yellow-600 " },
  success: { icon: "check-circle", classname: "text-green-700 " },
  error: { icon: "times-circle", classname: "text-red-600 " },
  info: { icon: "info-circle", classname: "text-slate-600 " },
};

export default function Alert(props: AlertProps) {
  return (
    <span className="absolute top-15 right-6 flex items-center justify-self-end min-h-10 max-w-96 text-xs font-bold border gap-3 px-3 py-2 rounded-xl shadow-lg bg-white">
      <FontAwesomeIcon
        icon={props.type.icon as IconProp}
        size="xl"
        className={props.type.classname}
      ></FontAwesomeIcon>

      {props.text}
    </span>
  );
}
