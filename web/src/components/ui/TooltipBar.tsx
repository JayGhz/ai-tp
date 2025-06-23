"use client";
import * as React from "react";
import { createPortal } from "react-dom";

export type Datum = {
  key: string;
  value: number;
  color?: string;
};

export type TooltipInfo = {
  x: number;
  y: number;
  datum: Datum;
};

export type TooltipBarContextValue = {
  tooltip: TooltipInfo | null;
  setTooltip: (tooltip: TooltipInfo | null) => void;
};

const TooltipBarContext = React.createContext<TooltipBarContextValue | undefined>(undefined);

export function useTooltipBarContext(componentName: string): TooltipBarContextValue {
  const context = React.useContext(TooltipBarContext);
  if (!context) {
    throw new Error(`${componentName} debe usarse dentro de un TooltipBar Context`);
  }
  return context;
}

export const TooltipBar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tooltip, setTooltip] = React.useState<TooltipInfo | null>(null);
  return (
    <TooltipBarContext.Provider value={{ tooltip, setTooltip }}>
      {children}
    </TooltipBarContext.Provider>
  );
};

const TRIGGER_NAME_BAR_DIV = "TooltipBarDivTrigger";

export type TooltipBarDivTriggerProps = {
  datum: Datum;
  children: React.ReactNode;
};

export const TooltipBarDivTrigger = React.forwardRef<HTMLDivElement, TooltipBarDivTriggerProps>(
  ({ datum, children }, forwardedRef) => {
    const { setTooltip } = useTooltipBarContext(TRIGGER_NAME_BAR_DIV);
    const triggerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      const handleClickOutside = (ev: MouseEvent | TouchEvent) => {
        if (triggerRef.current && !triggerRef.current.contains(ev.target as Node)) {
          setTooltip(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, [setTooltip]);

    return (
      <div
        ref={(node) => {
          triggerRef.current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        onPointerMove={(ev) => {
          if (ev.pointerType === "mouse") {
            setTooltip({ x: ev.clientX, y: ev.clientY, datum });
          }
        }}
        onPointerLeave={() => {
          setTooltip(null);
        }}
        onTouchStart={(ev) => {
          setTooltip({ x: ev.touches[0].clientX, y: ev.touches[0].clientY, datum });
          setTimeout(() => {
            setTooltip(null);
          }, 2000);
        }}
      >
        {children}
      </div>
    );
  }
);
TooltipBarDivTrigger.displayName = TRIGGER_NAME_BAR_DIV;

const CONTENT_NAME_BAR = "TooltipBarContent";

export const TooltipBarContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tooltip } = useTooltipBarContext(CONTENT_NAME_BAR);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const runningOnClient = typeof document !== "undefined";

  if (!tooltip || !runningOnClient) {
    return null;
  }

  const getTooltipPosition = () => {
    if (!tooltipRef.current) {
      return { top: tooltip.y - 20, left: tooltip.x + 10 };
    }
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const viewportWidth = window.innerWidth;
    const willOverflowRight = tooltip.x + tooltipWidth + 10 > viewportWidth;
    return {
      top: tooltip.y - 20,
      left: willOverflowRight ? tooltip.x - tooltipWidth - 10 : tooltip.x + 10,
    };
  };

  const isMobile = window.innerWidth < 768;

  return createPortal(
    isMobile ? (
      <div
        className="fixed h-fit z-60 w-fit rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3"
        style={{
          top: tooltip.y,
          left: tooltip.x + 20,
        }}
      >
        {children}
      </div>
    ) : (
      <div
        ref={tooltipRef}
        className="bg-white dark:bg-zinc-800 border rounded-md border-zinc-200 dark:border-zinc-800 px-3.5 py-2 fixed z-50"
        style={getTooltipPosition()}
      >
        {children}
      </div>
    ),
    document.body
  );
};
TooltipBarContent.displayName = CONTENT_NAME_BAR;
