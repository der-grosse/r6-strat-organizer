import React from "react";

const useDebounced = <T>(
  value: T,
  {
    debounceDelay = 500,
    onChange,
  }: {
    debounceDelay?: number;
    onChange?: (value: T) => void;
  } = {
    debounceDelay: 500,
    onChange: undefined,
  }
) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  // debounce handler
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onChange?.(value);
      setDebouncedValue(value);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounceDelay]);

  // call when component unmounts
  React.useEffect(() => {
    return () => {
      onChange?.(value);
    };
  }, []);

  return {
    value: debouncedValue,
    skipDebounce: (newValue?: T) => setDebouncedValue(newValue ?? value),
  };
};

export default useDebounced;
