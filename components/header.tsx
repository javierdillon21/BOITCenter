export default function Header(props: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col justify-center mb-8 gap-0">
      <p className="font-semibold text-lg md:text-2xl">{props.title}</p>
      {props.subtitle && (
        <p className="font-normal text-xs md:text-lg text-gray-400">
          {props.subtitle}
        </p>
      )}
    </div>
  );
}
