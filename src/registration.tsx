export function Registration({ data }: { data: Record<string, any> | null }) {
  if (!data) {
    return <p>Loading registration data...</p>;
  }

  return (
    <div>
      <h2>Registration</h2>
      <ul>
        {data &&
          Object.entries(data as Record<string, any>).map(
            ([key, value]: [string, any]) => (
              <li key={key}>
                <strong>{key.replace(/_/g, " ")}:</strong> {value}
              </li>
            ),
          )}
      </ul>
    </div>
  );
}
