import React from "react";
import { Input } from "../ui/input";

interface TextQuestionProps {
  title: string;
  description: string;
  textInputs: {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }[];
}

export const TextQuestion = ({
  title,
  description,
  textInputs,
}: TextQuestionProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-gray-100 rounded-lg p-3 w-full">
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="font-bold">{description}</h3>
        </div>
      </div>
      <div className="space-y-4">
        {textInputs.map((input, index) => (
          <Input
            key={index}
            placeholder={input.placeholder}
            value={input.value}
            onChange={input.onChange}
          />
        ))}
      </div>
    </div>
  );
};
