import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="input-wrapper" style={{ position: "relative" }}>
        {leftIcon && (
          <span 
            style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "var(--gray-400)",
              display: "flex"
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`form-input ${error ? "error" : ""} ${className}`.trim()}
          style={{
            paddingLeft: leftIcon ? "44px" : undefined,
            paddingRight: rightIcon ? "44px" : undefined,
          }}
          {...props}
        />
        {rightIcon && (
          <span 
            style={{ 
              position: "absolute", 
              right: "12px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "var(--gray-400)",
              display: "flex"
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-input form-textarea ${error ? "error" : ""} ${className}`.trim()}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}