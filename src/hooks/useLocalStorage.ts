import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);

      if (storedValue !== null) {
        return JSON.parse(storedValue) as T;
      }

      return initialValue;
    } catch (error) {
      console.error("Failed to read LocalStorage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save LocalStorage:", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
