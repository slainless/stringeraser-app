import { createEffect, createSignal, useContext } from "solid-js";
import { StoreContext } from "./store";

export function TextPane() {
  const { setText } = useContext(StoreContext);
  const [inputText, setInputText] = createSignal("");

  createEffect(() => {
    setText(inputText());
  });

  return (
    <div style={{ position: "relative" }}>
      <span
        contentEditable
        class={
          "p-5 outline-none bg-slate-1 inline-block w-full min-h-[100vh] overflow-x-auto whitespace-pre-wrap"
        }
        onpaste={(event) => {
          event.preventDefault();

          const clipboardData = event.clipboardData;
          const plainText = clipboardData?.getData("text/plain");

          const selection = window.getSelection();
          if (!selection?.rangeCount) return;

          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(plainText ?? ""));

          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          setInputText(event.target.textContent!);
        }}
        oninput={(event) => {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          setInputText(event.target.textContent!);
        }}
      />
      <span
        class="pointer-events-none absolute top-5 left-5 text-foreground/30"
        style={{
          display:
            inputText() == null || inputText() === "" ? "inline-block" : "none",
        }}
      >
        Insert target text to be matched against
      </span>
    </div>
  );
}