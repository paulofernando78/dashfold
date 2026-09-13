export function TextInput({
  value = "",
  onChange,
  name,
  id,
  placeholder,
  inputRef,
  className = "",
  ...props
}) {
  function resizeTextarea(element) {
    if (!element) return;

    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
  }

  function setInputRef(element) {
    resizeTextarea(element);

    inputRef?.(element);
  }

  function handleInput(event) {
    resizeTextarea(event.currentTarget);
    props.onInput?.(event);
  }

  return (
    <textarea
      rows={1}
      wrap="soft"
      style={{ resize: "none" }}
      ref={setInputRef}
      {...props}
      onInput={handleInput}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        block
        w-full
        max-w-full
        min-w-0
        text-lg
        font-['Indie_Flower',cursive]
        resize-none
        whitespace-pre-wrap
        wrap-break-words
        outline-none
        overflow-hidden
        ${className}
      `}
    />
  );
}
