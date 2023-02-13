import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { IconJava } from "../IconJava";
import { IconMicrosoft } from "../IconMicrosoft";

const platforms = [
  {
    name: "Java",
    Icon: IconJava,
    selectedColor: "bg-blue-100",
  },
  {
    name: "Bedrock",
    Icon: IconMicrosoft,
    selectedColor: "bg-slate-200",
  },
];

export const PlatformRadioGroup = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0].name);
  return (
    <RadioGroup value={selectedPlatform} onChange={setSelectedPlatform}>
      <RadioGroup.Label className="block text-sm font-medium text-gray-700">
        Referral Primary Platform
      </RadioGroup.Label>
      <div className="mt-1.5 flex items-center space-x-3">
        {platforms.map((platform) => (
          <RadioGroup.Option
            key={platform.name}
            value={platform.name}
            className={({ active, checked }) =>
              clsx(
                active && checked ? platform.selectedColor : "",
                checked ? platform.selectedColor : "",
                "-m-0.5 relative p-2 flex rounded flex-col gap-2 flex-1 items-center justify-center cursor-pointer focus:outline-none"
              )
            }
          >
            <platform.Icon className="w-8 h-8" />
            <RadioGroup.Label
              as="span"
              className="block text-center font-semibold"
            >
              {platform.name}
            </RadioGroup.Label>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};
