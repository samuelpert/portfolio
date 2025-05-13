"use client";
import { trackProjectView } from "./GoogleAnalytics";
import { FaLocationArrow } from "react-icons/fa6";
import { projects } from "@/app/data";
import { PinContainer } from "@/app/components/ui/PinContainer";
import Image from "next/image";

const Projects = () => {
  return (
    <div className="py-20" id="projects">
      <h1 className="heading">
        Most Recent{" "}
        <span className="bg-gradient-to-r from-[#FF0800] via-[#FF751B] to-[#FFE111] bg-clip-text text-transparent">
          Projects
        </span>
      </h1>
      <div className="flex flex-wrap items-center justify-center p-4 gap-x-24 gap-y-8 mt-10">
        {projects.map(({ id, title, des, img, iconLists, link }) => (
          <div
            className="sm:h-[41rem] h-[32rem] lg:min-h-[32.5rem] flex items-center justify-center sm:w-[570px] w-[80vw]"
            key={id}
            onClick={() => trackProjectView(title)}
          >
            <PinContainer title={link} href={link}>
              <div className="relative flex items-center justify-center sm:w-[570px] w-[80vw] overflow-hidden sm:h-[40vh] h-[30vh] mb-10">
                <div
                  className="relative w-full h-full overflow-hidden lg:rounded-3xl"
                  style={{ backgroundColor: "#13162D" }}
                >
                  <Image
                    src="/bg.png"
                    alt="bgimg"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-3xl"
                  />
                </div>
                <Image
                  src={img}
                  alt={title}
                  className="z-10 absolute rounded-3xl"
                  layout="fill"
                  objectFit="cover"
                  objectPosition="center"
                />
              </div>

              <h1 className="font-bold lg:text-2xl md:text-xl text-base line-clamp-1">
                {title}
              </h1>

              <p
                className="lg:text-xl lg:font-normal font-light text-sm line-clamp-3"
                style={{
                  color: "#BEC1DD",
                  margin: "1vh 0",
                }}
              >
                {des}
              </p>

              <div className="flex items-center justify-between mt-7 mb-3">
                <div className="flex items-center">
                  {iconLists.map((icon, index) => (
                    <div
                      key={icon}
                      className="border border-white/[.2] rounded-full bg-black lg:w-10 lg:h-10 w-8 h-8 flex justify-center items-center"
                      style={{
                        transform: `translateX(-${5 * index + 2}px)`,
                      }}
                    >
                      <Image
                        src={icon}
                        alt={icon}
                        className="p-2 rounded-full"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center">
                  <p className="flex lg:text-xl md:text-xs text-sm text-[#FF751B]">
                    Check Live Site
                  </p>
                  <FaLocationArrow className="ms-3" color="#FF751B" />
                </div>
              </div>
            </PinContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
