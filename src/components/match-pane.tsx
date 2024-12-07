import { Matcher } from "@/core/matcher";
import {
  createMemo,
  createSignal,
  For,
  Index,
  type JSX,
  Match,
  Switch,
  useContext,
} from "solid-js";
import { Checkbox, CheckboxControl } from "./ui/checkbox";
import { StoreContext } from "./store";
import { safeRegex } from "safe-regex2";

export function MatchPane() {
  const { store } = useContext(StoreContext);
  const [errors, setErrors] = createSignal<JSX.Element>();

  const filteredRegexps = createMemo(() => {
    return store.lookup.regexps.filter(
      (regexp) => regexp != null && regexp !== "",
    );
  });

  const matches = createMemo(() => {
    setErrors();
    const unsafe: string[] = [];
    for (const regexp of filteredRegexps())
      if (safeRegex(regexp) === false) unsafe.push(regexp);

    if (unsafe.length > 0) {
      setErrors(
        <div class="text-red-6">
          <div>Some of the regexp patterns are unsafe:</div>
          <Index each={unsafe}>
            {(item) => (
              <div>
                <code>{item()}</code>
              </div>
            )}
          </Index>
        </div>,
      );
      return [];
    }

    const matcher = new Matcher(store.lookup.strings, filteredRegexps());
    return matcher.findMatches(store.text);
  });

  return (
    <div class="p-5 h-[inherit] w-md overflow-y-auto border-r border-r-solid border-r-slate-2">
      <div class="flex flex-col gap-row-2">
        <Switch>
          <Match when={!isEmpty(errors())}>
            <div>{errors()}</div>
          </Match>
          <Match
            when={
              isEmpty(store.text) ||
              (isEmpty(store.lookup.strings) && isEmpty(filteredRegexps()))
            }
          >
            <div class="text-foreground/30">
              Fill text & lookup pattern first
            </div>
          </Match>
          <Match when={matches().length < 1}>
            <div class="text-foreground/30">No matching pattern found</div>
          </Match>
          <Match when={matches()}>
            <For each={matches()}>
              {(item) => {
                const { start, end } = item;

                let lower: number;
                let upper: number;

                const viewLength = 40;
                const matchLength = end - start;
                if (matchLength >= viewLength) {
                  lower = start;
                  upper = end;
                } else {
                  const pads = viewLength - matchLength;
                  const lowerPads = Math.floor(pads / 2);
                  const upperPads = pads - lowerPads;

                  lower = start - lowerPads;
                  upper = end + upperPads;
                }

                const sliced = store.text.slice(lower, upper + 1);
                return (
                  <div class="grid grid-cols-[max-content_auto] gap-col-2 w-full">
                    <div class="flex items-center justify-center">
                      <Checkbox>
                        <CheckboxControl />
                      </Checkbox>
                    </div>
                    <div>
                      <div>
                        <span>{sliced}</span>
                      </div>
                      <div class="text-xs">
                        <span>Matched with: </span>
                        <span>{item.match}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </Match>
        </Switch>
      </div>
    </div>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const isEmpty = (v?: any | any[]) => v == null || v === "" || v?.length < 1;
