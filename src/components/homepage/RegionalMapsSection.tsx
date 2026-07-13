import CemacMapSvg from "./CemacMapSvg";
import UemoaMapSvg from "./UemoaMapSvg";

export default function RegionalMapsSection() {
  return (
    <section className="w-full px-4 mt-16">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <CemacMapSvg noWrapper />
          <UemoaMapSvg noWrapper />
        </div>
      </div>
    </section>
  );
}
