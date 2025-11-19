import { useRef, useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollAwareContainerProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

interface ScrollEdges {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

export const ScrollAwareContainer = ({
  children,
  className,
  contentClassName,
}: ScrollAwareContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<ScrollEdges>({
    left: false,
    right: false,
    top: false,
    bottom: false,
  });

  const updateEdges = () => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = element;

    setEdges({
      left: scrollLeft > 2,
      right: scrollLeft + clientWidth < scrollWidth - 2,
      top: scrollTop > 2,
      bottom: scrollTop + clientHeight < scrollHeight - 2,
    });
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    updateEdges();

    const resizeObserver = new ResizeObserver(() => updateEdges());
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={cn("scroll-aware-wrapper", className)}
      data-has-horizontal={edges.left || edges.right}
      data-has-vertical={edges.top || edges.bottom}
    >
      <div
        ref={scrollRef}
        className={cn("scroll-aware-content", contentClassName)}
        onScroll={updateEdges}
      >
        {children}
      </div>

      <span
        className="scroll-shadow scroll-shadow-left"
        aria-hidden="true"
        data-active={edges.left}
      />
      <span
        className="scroll-shadow scroll-shadow-right"
        aria-hidden="true"
        data-active={edges.right}
      />
      <span
        className="scroll-shadow scroll-shadow-top"
        aria-hidden="true"
        data-active={edges.top}
      />
      <span
        className="scroll-shadow scroll-shadow-bottom"
        aria-hidden="true"
        data-active={edges.bottom}
      />
    </div>
  );
};

