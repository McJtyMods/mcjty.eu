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

  const hasValidators = Object.keys(DATA[version]).length > 0;

  const controls = (
    <>
      <label className="validator-field">
        <span className="validator-field__label">Minecraft</span>
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value as MinecraftVersion)}
          className="validator-select"
        >
          {Object.keys(DATA).map((version) => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>
      </label>
      <div className="validator-tabs" role="tablist" aria-label="Rule file">
        {Object.keys(DATA[version]).map((validator) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === validator}
            key={validator}
            className={clsx(
              "validator-tab",
              tab === validator && "validator-tab--active",
            )}
            onClick={() => setTab(validator as ValidatorType)}
          >
            {validator}.json
          </button>
        ))}
      </div>
    </>
  );

  if (!hasValidators) {
    return <p>No validators for this version!</p>;
  }

  return (
    <Validator
      controls={controls}
      type={tab as ValidatorType}
      version={version}
      text={text[tab as ValidatorType]}
      setText={(text) => {
        setText((prev) => ({ ...prev, [tab as ValidatorType]: text }));
      }}
    />
  );
};

export default ControlValidator;
