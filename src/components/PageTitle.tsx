interface props {
  mainText: string,
  subText?: string
}

const PageTitle = ({mainText, subText}: props) => {
  return (
    <div className="bg-slate-900 rounded-lg p-1">
      <h1 className="text-base md:text-1xl font-normal text-white">{mainText}<span className="font-extralight"> {subText}</span></h1>
    </div>
  );
};

export default PageTitle