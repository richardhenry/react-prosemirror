import { render, screen } from "@testing-library/react";
import React, { useState } from "react";
import { schema } from 'prosemirror-schema-basic'
import { EditorState } from "prosemirror-state";

import { reactKeys } from "../../plugins/reactKeys.js";
import { ProseMirror } from "../ProseMirror.js";
import { ProseMirrorDoc } from "../ProseMirrorDoc.js";

describe("ProseMirror sibling reordering", () => {
  it("keeps content and remains editable after sibling order changes", async () => {
    function TestCase() {
      const [editorState, setEditorState] = useState(
        EditorState.create({
          schema,
          plugins: [reactKeys()],
        })
      );

      const [elements, setElements] = useState(["editor", "other"]);

      return (
        <>
          <button
            id="toggle"
            type="button"
            onClick={() => setElements((v) => [...v].reverse())}
          >
            Toggle order
          </button>

          <ul>
            {elements.map((element) => (
              <li key={element}>
                {element === "editor" ? (
                  <ProseMirror
                    state={editorState}
                    dispatchTransaction={(tr) =>
                      setEditorState((s) => s.apply(tr))
                    }
                  >
                    <ProseMirrorDoc data-testid="editor" />
                  </ProseMirror>
                ) : (
                  <>This is just some text</>
                )}
              </li>
            ))}
          </ul>
        </>
      );
    }

    render(<TestCase />);

    // Type initial text
    const editor = screen.getByTestId("editor");
    editor.focus();
    await browser.keys("H");
    await browser.keys("i");

    // Reorder siblings
    await $("#toggle").click();

    // Type more text after reorder
    const editorAfter = await screen.findByTestId("editor");
    editorAfter.focus();
    await browser.keys(" ");
    await browser.keys("w");
    await browser.keys("o");
    await browser.keys("r");
    await browser.keys("l");
    await browser.keys("d");

    // Expected behavior: content remains and is editable
    expect(editorAfter.textContent).toBe("Hi world");
  });
});
