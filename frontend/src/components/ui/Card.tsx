import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ 
  children, 
  className = "", 
  onClick,
  hover = true 
}: CardProps) {
  return (
    <div 
      className={`card ${onClick ? "card-clickable" : ""} ${className}`.trim()}
      onClick={onClick}
      style={!hover ? { transform: "none" } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return <div className={`card-header ${className}`.trim()}>{children}</div>;
}

export function CardBody({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return <div className={`card-body ${className}`.trim()}>{children}</div>;
}

export function CardFooter({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return <div className={`card-footer ${className}`.trim()}>{children}</div>;
}
