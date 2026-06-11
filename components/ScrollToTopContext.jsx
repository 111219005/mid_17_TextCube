import React, { createContext, useRef } from "react";

export const ScrollToTopContext = createContext({
  register: () => {},
  scrollToTop: () => {},
});

export function ScrollToTopProvider({ children }) {
  const targetRef = useRef(null);

  const register = (r) => {
    if (!r) {
      targetRef.current = null;
      return;
    }
    // accept either a ref object or a node
    if (r.current) targetRef.current = r.current;
    else targetRef.current = r;
  };

  const scrollToTop = () => {
    const node = targetRef.current;
    if (!node) return;
    if (typeof node.scrollTo === "function") {
      node.scrollTo({ y: 0, animated: true });
    } else if (typeof node.scrollToOffset === "function") {
      node.scrollToOffset({ offset: 0, animated: true });
    }
  };

  return (
    <ScrollToTopContext.Provider value={{ register, scrollToTop }}>
      {children}
    </ScrollToTopContext.Provider>
  );
}

export default ScrollToTopProvider;
