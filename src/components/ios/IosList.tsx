"use client";

import { Glyph } from "./Glyph";

export function IosGroup({
  header,
  footer,
  children,
}: {
  header?: string;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ios-group">
      {header && <p className="ios-group-header">{header}</p>}
      <div className="ios-group-body">{children}</div>
      {footer && <p className="ios-group-footer">{footer}</p>}
    </section>
  );
}

export function IosRow({
  icon,
  tint,
  label,
  value,
  chevron,
  onPress,
  destructive,
  center,
  detail,
}: {
  icon?: React.ReactNode;
  tint?: string;
  label: string;
  value?: string;
  chevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  center?: boolean;
  detail?: string;
}) {
  const inner = (
    <>
      {icon && (
        <span className="ios-row-icon" style={tint ? { background: tint } : undefined}>
          {icon}
        </span>
      )}
      <span className="ios-row-main">
        <span className={`ios-row-label ${destructive ? "ios-destructive" : ""} ${center ? "ios-center" : ""}`}>
          {label}
        </span>
        {detail && <span className="ios-row-detail">{detail}</span>}
      </span>
      {value && <span className="ios-row-value">{value}</span>}
      {chevron && <Glyph name="chevron" className="ios-chevron" />}
    </>
  );

  if (!onPress) return <div className={`ios-row ${icon ? "ios-row-hasicon" : ""}`}>{inner}</div>;
  return (
    <button type="button" className={`ios-row ios-row-tap ${icon ? "ios-row-hasicon" : ""}`} onClick={onPress}>
      {inner}
    </button>
  );
}

export function IosSwitchRow({
  icon,
  tint,
  label,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  tint?: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={`ios-row ${icon ? "ios-row-hasicon" : ""}`}>
      {icon && <span className="ios-row-icon" style={tint ? { background: tint } : undefined}>{icon}</span>}
      <span className="ios-row-main"><span className="ios-row-label">{label}</span></span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`ios-switch ${checked ? "ios-switch-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ios-switch-knob" />
      </button>
    </div>
  );
}
