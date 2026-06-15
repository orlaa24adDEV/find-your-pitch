import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const id = useId();
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-ink-600 mb-1">
            {label}
          </label>
        )}
        <input
          id={label ? id : undefined}
          ref={ref}
          className={`w-full px-4 py-2.5 border rounded-lg text-ink placeholder-ink-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-ink-200 focus:ring-pitch focus:border-pitch"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
