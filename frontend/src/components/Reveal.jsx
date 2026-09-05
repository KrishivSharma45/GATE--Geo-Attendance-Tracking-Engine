/**
 * Entrance wrapper: fades + rises its children on mount via a pure CSS
 * animation (see `.reveal` in styles.css). No JS scroll observers — the
 * content is always in the DOM and always ends fully visible.
 */
export default function Reveal({ children, as: Tag = 'div', delay = 0, className = '', ...rest }) {
  return (
    <Tag
      className={`reveal ${className}`.trim()}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
