// component/input.tsx

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// Union type to allow both input and textarea attributes
type InputProps = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    name?: string;
    placeholder?: string;
    type?: string;
    className?: string;
    helperText?: string;
    status?: string;
    textColor?: boolean | string;
    as?: "input" | "textarea"; // Add this prop to choose between input and textarea
  };

const Input = ({
  label,
  name,
  placeholder,
  type = "text",
  className,
  helperText,
  status,
  textColor,
  as = "input", // Default to 'input'
  ...rest
}: InputProps) => {
  const commonProps = {
    id: name,
    name,
    placeholder,
    className: `${className} mt-1 block w-full p-2 border bg-transparent ${
      status === "danger" ? "border-red-500" : "border-gray-300"
    } rounded-md shadow-sm placeholder:text-gray-300 ${
      textColor ? "text-black" : "text-white"
    } focus:outline-none focus:ring-[#216869] focus:border-[#216869']`,
    ...rest,
  };

  return (
    <div className="mb-4 w-full relative">
      {label && (
        <label htmlFor={name} className="block text-gray-100">
          {label}
        </label>
      )}
      {as === "input" ? (
        <input type={type} {...commonProps} />
      ) : (
        <textarea rows={5} {...commonProps} />
      )}
      {helperText && (
        <div className="text-red-500 text-sm mt-1">{helperText}</div>
      )}
    </div>
  );
};

export default Input;
