"use client";

import { useState } from "react";
import { menuItems } from "@/data/menu";

export default function MegaMenu() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <nav className="bg-white border-t border-b">

      <div className="max-w-[1600px] mx-auto">

        <ul className="flex gap-8 px-6">

          {menuItems.map((item, index) => (
            <li
              key={index}
              className="relative py-4"
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >

              <button className="font-semibold hover:text-red-600">
                {item.label}
              </button>

              {active === index && (
                <div
                  className="
                    absolute
                    top-full
                    left-0
                    bg-white
                    shadow-xl
                    rounded-lg
                    p-4
                    min-w-[250px]
                    z-50
                  "
                >

                  {item.children.map((child) => (
                    <div
                      key={child}
                      className="
                        py-2
                        hover:text-red-600
                        cursor-pointer
                      "
                    >
                      {child}
                    </div>
                  ))}

                </div>
              )}

            </li>
          ))}

        </ul>

      </div>

    </nav>
  );
}