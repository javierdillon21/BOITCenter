export default function Header(props: { title: string; subtitle?: string; italicSubtitle?: boolean }) {
  return (
    <div className="flex flex-col justify-center mb-8 gap-0">
      <p className="font-semibold text-lg md:text-2xl">{props.title}</p>
      {props.subtitle && (
        <p className={`font-normal lg:text-sm text-gray-400 ${props.italicSubtitle? "italic":""}`} >
          {props.subtitle}
        </p>
      )}
    </div>
  );
}
