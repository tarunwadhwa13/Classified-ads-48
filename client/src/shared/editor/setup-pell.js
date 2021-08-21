/**
 * ADD 'github.com/jaredreich/pell' RICH EDITOR
 * MUST EXIST:
 *    #editor
 *    #html-output
 *    #characters-left
 *    .add#description
 */
import { LIS } from "../../helpers/lis";
import { stripHtml } from "./helpers/stripe-html";
import pell from "pell";
export const setupPell = () => {
  // on succeeds on pages with `editor` and `html-output` and other inputs
  try {
    const editor = pell.init({
      element: LIS.id("editor"),
      onChange: (html) => {
        LIS.id("html-output").textContent = html;
        const raw = stripHtml(html);
        const charactersLeft = 200 - raw.length;
        const count = LIS.id("characters-left");
        count.innerHTML = "Characters left: " + charactersLeft;
        document.querySelectorAll(".add#description")[0].value = html;
      },
      classes: {
        actionbar: "pell-actionbar",
        button: "pell-button",
        content: "pell-content",
        selected: "pell-button-selected",
      },
    });
    // editor.content<HTMLElement>
    // To change the editor's content:
    editor.content.innerHTML = "";
  } catch (error) {
    console.log(
      "Maybe running where pen is not in HTML | ERROR: ",
      error.message
    );
  }
};
