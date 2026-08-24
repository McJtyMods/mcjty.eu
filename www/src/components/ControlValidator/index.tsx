import {
  DATA,
  type MinecraftVersion,
  VALIDATOR_TYPES,
  type ValidatorType,
} from "@site/src/components/ControlValidator/data";
import clsx from "clsx";
import { useEffect, useState } from "react";
import Validator from "./Validator";

const initialText = Object.fromEntries(
  VALIDATOR_TYPES.map((type) => [type, ""]),
) as Record<ValidatorType, string>;

const ControlValidator: React.FC = () => {
  const [version, setVersion] = useState<MinecraftVersion>("1.20.1");
  const [tab, setTab] = useState<ValidatorType | null>(
    // TODO: clean this mess up
    Object.keys(DATA[version]).map((v) => v as ValidatorType)[0],
  );
  const [text, setText] = useState<Record<ValidatorType, string>>(initialText);

  useEffect(() => {
    if (Object.keys(DATA[version]).length === 0) {
      setTab(null);
    } else {
      setTab(Object.keys(DATA[version]).map((v) => v as ValidatorType)[0]);
    }
  }, [version]);

  return (
    <div style={{ width: "100%" }}>
      <div className="mx-auto flex w-2/3 flex-col gap-x-8 p-4 md:flex-row">
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value as MinecraftVersion)}
          className="button button--primary button--lg"
        >
          {Object.keys(DATA).map((version) => (
            <option
              key={version}
              value={version}
              style={{ backgroundColor: "white", color: "black" }}
            >
              {version}
            </option>
          ))}
        </select>
        <div
          className="tabs tabs--block w-full"
          role="tablist"
          aria-label="Rule file"
        >
          {Object.keys(DATA[version]).map((validator) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === validator}
              key={validator}
              className={clsx(
                "tabs__item",
                tab === validator && "tabs__item--active",
              )}
              onClick={() => setTab(validator as ValidatorType)}
            >
              {validator}.json
            </button>
          ))}
        </div>
      </div>
      <br />
      <div className="mx-auto md:w-2/3">
        <Validator
          type={tab as ValidatorType}
          version={version}
          text={text[tab as ValidatorType]}
          setText={(text) => {
            setText((prev) => ({ ...prev, [tab as ValidatorType]: text }));
          }}
        />
        {Object.keys(DATA[version]).length === 0 && (
          <p>No validators for this version!</p>
        )}
      </div>
    </div>
  );
};

export default ControlValidator;
