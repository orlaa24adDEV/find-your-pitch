import { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Card = ({ children, className = "", ...props }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-ink-100 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
