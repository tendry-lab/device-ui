import { useEffect, useState } from "preact/hooks";

// Periodic fetching parameters.
export type PeriodicFetcherProps = {
  interval: number;
  url: string;
};

// Once per @p interval (milliseconds) fetch @p url resource.
export function usePeriodicFetcher(
  props: PeriodicFetcherProps,
): Record<string, any> | null {
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(props.url);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else {
          console.error("Failed to fetch data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalID = setInterval(fetchData, props.interval);

    return () => clearInterval(intervalID);
  }, [props.interval, props.url]);

  return data;
}
