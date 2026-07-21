import React from "react";

const MagicButton = ({
  title,
  icon,
  position,
  handleClick,
  otherClasses,
}: {
  title: string;
  icon: React.ReactNode;
  position: string;
  handleClick?: () => void;
  otherClasses?: string;
}) => {
  return (
    <button
      className={`inline-flex h-12 w-full md:w-50 md:mt-10 items-center justify-center rounded-lg
           border bg-slate-950 px-7 text-sm font-medium text-white gap-2 focus:outline-none ${otherClasses}`}
      style={{ borderColor: "#FF751B" }}
      onClick={handleClick}
    >
      {position === "left" && icon}
      {title}
      {position === "right" && icon}
    </button>
  );
};

export default MagicButton;
