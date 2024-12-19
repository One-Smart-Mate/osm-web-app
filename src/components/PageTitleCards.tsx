interface Props {
  mainText: string;
  subText?: string;
  primaryColor: string;
}

const PageTitleCards = ({ mainText, subText, primaryColor }: Props) => {
  return (
    <h1 className="text-3xl md:text-4xl font-semibold text-black">
      {mainText} <span className="font-bold" style={{ color: primaryColor }}>
        {subText}
      </span>
    </h1>
  );
};




export default PageTitleCards;
