import { type ChangeEvent, type FormEvent, useState } from "react";
import { DATA, type MinecraftVersion, type ValidatorType } from "./data";
import JSONParser from "./jsonParser";
import { formatErrorLine } from "./utils";

type Props = {
  type: ValidatorType;
  version: MinecraftVersion;
  text: string;
  setText: (text: string) => void;
};

type ValidationMessage = {
  key: string;
  message: string;
  color: string;
};

function describeParseError(error: unknown, text: string) {
  const message =
    error instanceof Error ? error.message : "Unknown parse error";
  const match = message.match(/position (\d+)/);
  if (match === null) {
    return message;
  }

  const position = Number.parseInt(match[1], 10);
  const beforeError = text.slice(0, position);
  const line = beforeError.split("\n").length;
  const lastNewline = beforeError.lastIndexOf("\n");
  const column = position - lastNewline;
  return `${message} (line ${line}, column ${column})`;
}

// TODO: add syntax highlighting
const Validator: React.FC<Props> = (props) => {
  const schema = DATA[props.version][props.type];

  const [parseError, setParseError] = useState<string>("");
  const [zodErrors, setZodErrors] = useState<ValidationMessage[]>([]);
  const [success, setSuccess] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    props.setText(event.target.value);
  };

  const handleValidation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Validating...");

    setValidating(true);
    setParseError("");
    setZodErrors([]);
    setSuccess(false);

    try {
      // const json = JSON.parse(props.text);
      const json = new JSONParser(props.text).parse();

      props.setText(JSON.stringify(json, null, 2));

      const result = schema.safeParse(json);

      if (result.success === false) {
        console.log("Invalid: Zod Error!");

        const output = result.error.issues.map((error) => {
          const path = error.path.map(String).join(".");
          return {
            key: `${error.code}:${path}:${error.message}`,
            message: formatErrorLine(error),
            color: error.message.startsWith("Warning:") ? "orange" : "red",
          };
        });

        console.log(output);

        setZodErrors(output);
      } else {
        console.log("Valid!");

        props.setText(JSON.stringify(result.data, null, 2));

        setSuccess(true);
      }
    } catch (error) {
      console.log("Invalid: Parse Error!");

      setParseError(describeParseError(error, props.text));
    }

    setValidating(false);
  };

  return (
    <form
      onSubmit={handleValidation}
      className="flex h-full w-full flex-col justify-center gap-x-4 gap-y-4 md:flex-row"
    >
      {/* TODO: add syntax highlighting */}
      <div className="w-full">
        <textarea
          value={props.text}
          onChange={handleTextChange}
          placeholder={`Paste ${props.type}.json for Minecraft ${props.version} here...`}
          required
          className="h-[400px] w-full rounded p-2 font-mono"
        />
      </div>
      <div className="flex h-full w-full flex-col justify-center">
        <button
          type="submit"
          className="button button--primary button--lg"
          disabled={validating}
        >
          {validating ? "Validating..." : "Validate"}
        </button>
        <br />
        {parseError && (
          <pre className="w-full whitespace-pre-wrap">
            <span style={{ color: "red" }}>{parseError}</span>
          </pre>
        )}
        {zodErrors.length > 0 && (
          <pre className="w-full whitespace-pre-wrap">
            {zodErrors.map((error) => (
              <span key={error.key} style={{ color: error.color }}>
                {error.message}
                {"\n"}
              </span>
            ))}
          </pre>
        )}
        {success && (
          <pre className="w-full whitespace-pre-wrap">
            <span style={{ color: "green" }}>
              Valid JSON using the settings known to this validator.
            </span>
          </pre>
        )}
      </div>
    </form>
  );
};

export default Validator;
