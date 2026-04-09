import { Card } from "../Card/Card";

const TUTORIAL =
  "We're here to help you find your seat. Your table number should appear on the screen after following the steps:";

const INSTRUCTIONS = [
  "Upload csv with seating information via the 'upload' button below",
  "Enter your name in the search field",
  "Submit the form",
];

export function Instructions() {
  return (
    <Card>
      <h2 className="text-2xl mb-2">Instructions</h2>
      <p className="mb-4">{TUTORIAL}</p>
      <ol>
        {INSTRUCTIONS.map((wording, index) => (
          <li key={wording}>
            <InstructionPoint value={index + 1} />
            {wording}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function InstructionPoint(props: { value: number }) {
  return <span className="inline-block w-4 text-center">{props.value}.</span>;
}
