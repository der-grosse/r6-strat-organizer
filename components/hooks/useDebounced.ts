import React from "react";

const useDebounced = <T>(
  value: T,
  {
    debounceDelay = 500,
    onChange,
  }: {
    debounceDelay?: number;
    onChange?: (value: T) => void | Promise<void>;
  } = {
    debounceDelay: 500,
    onChange: undefined,
  }
) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  const latestValueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);
  latestValueRef.current = value;
  onChangeRef.current = onChange;
  const latestSavedValueRef = React.useRef(value);

  // debounce handler
  React.useEffect(() => {
    const handler = setTimeout(async () => {
      setDebouncedValue(value);
      await onChangeRef.current?.(value);
      latestSavedValueRef.current = value;
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounceDelay]);

  // call when component unmounts
  React.useEffect(() => {
    return () => {
      if (latestValueRef.current === latestSavedValueRef.current) return;
      onChangeRef.current?.(latestValueRef.current);
    };
  }, []);

  return {
    value: debouncedValue,
    skipDebounce: (newValue?: T) => setDebouncedValue(newValue ?? value),
  };
};

export default useDebounced;
