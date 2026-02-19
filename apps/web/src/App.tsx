import type { DemoViewModel } from "./types";

export function App(props: { data: DemoViewModel }) {
  const { data } = props;

  return (
    <main>
      <h1>CivicGuard Demo</h1>
      <section>
        <h2>Transcript</h2>
        <p>{data.transcript}</p>
      </section>
      <section>
        <h2>Case Visit Summary</h2>
        <p>{data.summary}</p>
      </section>
      <section>
        <h2>High Stress Flags</h2>
        <ul>
          {data.flags.map((flag) => (
            <li key={flag.keyword}>
              {flag.keyword} ({flag.severity})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
