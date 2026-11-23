# CSV question import — local demo only

The import UX is independently implemented for Evaluify, using the Examify question-bank and CSV feature flow as a **design reference**, not a wholesale copy.

## Input

- CSV text encoded as UTF-8.
- Limit: 50 questions and 150,000 characters per batch.
- Required headers: `text,type,correct_answer,options,points,category,sub_category,rights_basis`.
- Optional headers: `source_title,tags,skills`.
- Supported question types: `multiple-choice`, `multiple-select`, `true-false`.
- For multiple choice/select, separate choices using `|`; multiple-select answers also use `|`.
- Rights basis: `original`, `licensed`, or `open-license`. Licensed/open content must include a source title or permission reference.
- Records using quoted comma/newline fields and escaped quotes are supported.

See `examples/question-bank-demo.csv` for synthetic examples. The import is atomic within one browser session: if any row fails validation, no rows from that batch are stored. Imported and manually edited items default to Draft and require a teacher review action.

**Caveat:** the local reviewer button does not prove real user authorization, actual intellectual-property rights, or pedagogical correctness. No real student data or third-party copyrighted questions should be imported during this prototype stage.
