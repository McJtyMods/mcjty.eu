import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";
import { DATA, type MinecraftVersion, type ValidatorType } from "./data";
import JSONParser from "./jsonParser";
import { formatErrorLine } from "./utils";

type Props = {
  controls: ReactNode;
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

  const warningCount = zodErrors.filter(
    (error) => error.color === "orange",
  ).length;
  const errorCount = zodErrors.length - warningCount;

  let status: { label: string; tone: string } | null = null;
  if (parseError) {
    status = { label: "Invalid JSON", tone: "danger" };
  } else if (zodErrors.length > 0) {
    status = {
      label: `${zodErrors.length} issue${zodErrors.length === 1 ? "" : "s"}`,
      tone: errorCount > 0 ? "danger" : "warning",
    };
  } else if (success) {
    status = { label: "Valid", tone: "success" };
  }

  return (
    <form onSubmit={handleValidation} className="validator-card">
      <div className="validator-toolbar">
        <div className="validator-toolbar__controls">{props.controls}</div>
        <button
          type="submit"
          className="button button--primary validator-submit"
          disabled={validating}
        >
          {validating ? "Validating..." : "Validate"}
        </button>
      </div>
      <div className="validator-body">
        {/* TODO: add syntax highlighting */}
        <textarea
          value={props.text}
          onChange={handleTextChange}
          placeholder={`Paste ${props.type}.json for Minecraft ${props.version} here...`}
          required
          aria-label={`${props.type}.json contents`}
          className="validator-editor"
          spellCheck={false}
        />
        <section className="validator-results" aria-live="polite">
          <header className="validator-results__header">
            <h2 className="validator-results__title">Results</h2>
            {status && (
              <span
                className={`validator-status validator-status--${status.tone}`}
              >
                {status.label}
              </span>
            )}
          </header>
          {parseError && (
            <div className="validator-issue validator-issue--error">
              {parseError}
            </div>
          )}
          {zodErrors.length > 0 && (
            <ul className="validator-issues">
              {zodErrors.map((error) => (
                <li
                  key={error.key}
                  className={
                    error.color === "orange"
                      ? "validator-issue validator-issue--warning"
                      : "validator-issue validator-issue--error"
                  }
                >
                  {error.message}
                </li>
              ))}
            </ul>
          )}
          {success && (
            <p className="validator-results__empty">
              Valid JSON using the settings known to this validator. The editor
              now shows your file reformatted.
            </p>
          )}
          {!status && (
            <p className="validator-results__empty">
              Paste your file and select Validate. Errors and warnings are
              listed here, and the editor reformats your file when it parses.
            </p>
          )}
        </section>
      </div>
    </form>
  );
};

export default Validator;
