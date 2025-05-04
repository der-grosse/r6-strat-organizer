import StratsDB from "@/src/db";

export default async function StratsPage() {
  const strats = StratsDB.list();
  return (
    <table>
      <thead>
        <tr>
          <td>id</td>
          <td>map</td>
          <td>site</td>
          <td>name</td>
          <td>preview</td>
          <td>edit</td>
        </tr>
      </thead>
      <tbody>
        {strats.map((strat) => (
          <tr key={strat.id}>
            <td>{strat.id}</td>
            <td>{strat.map}</td>
            <td>{strat.site}</td>
            <td>{strat.name}</td>
            <td>
              <a
                href={strat.previewURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Preview
              </a>
            </td>
            <td>
              <a href={strat.editURL} target="_blank" rel="noopener noreferrer">
                Edit
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
